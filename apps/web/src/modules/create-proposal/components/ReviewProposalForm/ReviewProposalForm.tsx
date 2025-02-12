import { prepareWriteContract, writeContract } from '@wagmi/core'
import { Box, Flex } from '@zoralabs/zord'
import axios from 'axios'
import { Field, FieldProps, Formik } from 'formik'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useContractRead, useSigner } from 'wagmi'

import { ContractButton } from 'src/components/ContractButton'
import TextInput from 'src/components/Fields/TextInput'
import AnimatedModal from 'src/components/Modal/AnimatedModal'
import { SuccessModalContent } from 'src/components/Modal/SuccessModalContent'
import { SUCCESS_MESSAGES } from 'src/constants/messages'
import { governorAbi, tokenAbi } from 'src/data/contract/abis'
import { useDaoStore } from 'src/modules/dao'
import { ErrorResult } from 'src/services/errorResult'
import { Simulation, SimulationResult } from 'src/services/simulationService'
import { useChainStore } from 'src/stores/useChainStore'
import { AddressType, CHAIN_ID } from 'src/typings'

import { BuilderTransaction, useProposalStore } from '../../stores'
import { prepareProposalTransactions } from '../../utils/prepareTransactions'
import { MarkdownEditor } from './MarkdownEditor'
import { Transactions } from './Transactions'
import { ERROR_CODE, FormValues, validationSchema } from './fields'

const CHAINS_TO_SIMULATE = [CHAIN_ID.ETHEREUM, CHAIN_ID.GOERLI, CHAIN_ID.OPTIMISM_GOERLI]

interface ReviewProposalProps {
  disabled: boolean
  title?: string
  summary?: string
  transactions: BuilderTransaction[]
}

export const ReviewProposalForm = ({
  disabled: disabledForm,
  title,
  summary,
  transactions,
}: ReviewProposalProps) => {
  const router = useRouter()
  const { data: signer } = useSigner()
  const addresses = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  //@ts-ignore
  const signerAddress = signer?._address
  const { clearProposal } = useProposalStore()

  const [error, setError] = useState<string | undefined>()
  const [simulationError, setSimulationError] = useState<string | undefined>()
  const [simulating, setSimulating] = useState<boolean>(false)
  const [simulations, setSimulations] = useState<Array<Simulation>>([])
  const [proposing, setProposing] = useState<boolean>(false)

  const { data: votes, isLoading } = useContractRead({
    address: addresses?.token as AddressType,
    abi: tokenAbi,
    enabled: !!signerAddress,
    functionName: 'getVotes',
    chainId: chain.id,
    args: [signerAddress as AddressType],
  })

  const { data: proposalThreshold, isLoading: thresholdIsLoading } = useContractRead({
    address: addresses?.governor as AddressType,
    chainId: chain.id,
    abi: governorAbi,
    functionName: 'proposalThreshold',
  })

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      setError(undefined)
      setSimulationError(undefined)
      setSimulations([])

      try {
        const isWrongNetwork =
          (await signer?.provider?.getCode(addresses.auction || '')) === '0x'
      } catch (e) {
        setError(ERROR_CODE.WRONG_NETWORK)
        return
      }

      if (!proposalThreshold) return

      const votesToNumber = votes ? votes.toNumber() : 0
      const doesNotHaveEnoughVotes = votesToNumber <= proposalThreshold.toNumber()
      if (doesNotHaveEnoughVotes) {
        setError(ERROR_CODE.NOT_ENOUGH_VOTES)
        return
      }

      const {
        targets,
        values: transactionValues,
        calldata,
      } = prepareProposalTransactions(values.transactions)

      if (!!CHAINS_TO_SIMULATE.find((x) => x === chain.id)) {
        let simulationResults
        try {
          setSimulating(true)

          simulationResults = await axios
            .post<SimulationResult>('/api/simulate', {
              treasuryAddress: addresses?.treasury,
              chainId: chain.id,
              calldatas: calldata,
              values: transactionValues,
              targets,
            })
            .then((res) => res.data)
        } catch (err) {
          if (axios.isAxiosError(err)) {
            const data = err.response?.data as ErrorResult
            setSimulationError(data.error)
          } else {
            setSimulationError('Unable to simulate these transactions')
          }
          return
        } finally {
          setSimulating(false)
        }
        const simulationFailed = simulationResults?.success === false
        if (simulationFailed) {
          const failed =
            simulationResults?.simulations.filter(({ success }) => success === false) ||
            []
          setSimulations(failed)
          return
        }
      }

      try {
        const params = {
          targets: targets,
          values: transactionValues,
          calldatas: calldata as Array<AddressType>,
          description: values.title + '&&' + values.summary,
        }

        const config = await prepareWriteContract({
          abi: governorAbi,
          functionName: 'propose',
          address: addresses?.governor!,
          chainId: chain.id,
          args: [params.targets, params.values, params.calldatas, params.description],
        })

        const { wait } = await writeContract(config)

        setProposing(true)
        await wait()

        router
          .push({
            pathname: `/dao/[network]/[token]`,
            query: {
              network: router.query?.network,
              token: router.query?.token,
              message: SUCCESS_MESSAGES.PROPOSAL_SUBMISSION_SUCCESS,
            },
          })
          .then(() => {
            setProposing(false)
            clearProposal()
          })
      } catch (err: any) {
        setProposing(false)
        if (err.code === 'ACTION_REJECTED') {
          setError(ERROR_CODE.REJECTED)
          return
        }

        setError(err.message)
      }
    },
    [signer, router, addresses, proposalThreshold, votes, clearProposal]
  )

  if (isLoading || thresholdIsLoading) return null

  const tokensNeeded = proposalThreshold && proposalThreshold.toNumber() + 1

  return (
    <Flex direction={'column'} width={'100%'} pb={'x24'}>
      <Flex direction={'column'} width={'100%'}>
        <Formik
          validationSchema={validationSchema}
          initialValues={{ summary, title: title || '', transactions }}
          validateOnMount={false}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={onSubmit}
        >
          {(formik) => (
            <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
              <Transactions
                disabled={disabledForm}
                transactions={transactions}
                simulations={simulations}
                simulationError={simulationError}
              />

              <Field name="title">
                {({ field }: FieldProps) => (
                  <TextInput
                    {...formik.getFieldProps('title')}
                    id={'title'}
                    inputLabel={'Proposal Title'}
                    type={'text'}
                    disabled={disabledForm}
                    errorMessage={formik.errors['title']}
                  />
                )}
              </Field>

              <Field name="summary">
                {({ field }: FieldProps) => (
                  <MarkdownEditor
                    value={field.value}
                    onChange={(value: string) => formik?.setFieldValue(field.name, value)}
                    disabled={disabledForm}
                    inputLabel={'Summary'}
                    errorMessage={formik.errors['summary']}
                  />
                )}
              </Field>

              <ContractButton
                mt={'x3'}
                width={'100%'}
                borderRadius={'curved'}
                loading={simulating}
                disabled={simulating || proposing}
                h={'x15'}
                handleClick={() => formik.submitForm()}
              >
                <Box>{'Submit Proposal'}</Box>
                {votes && (
                  <Box
                    position={'absolute'}
                    right={{ '@initial': 'x2', '@768': 'x4' }}
                    px={'x3'}
                    py={'x1'}
                    borderRadius={'normal'}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {votes.toNumber()} Votes
                  </Box>
                )}
              </ContractButton>
            </form>
          )}
        </Formik>
      </Flex>

      <Flex mb={'x12'} mt={'x4'} color="text3" alignSelf={'center'}>
        You must have {tokensNeeded}{' '}
        {!!tokensNeeded && tokensNeeded > 1 ? 'votes' : 'vote'} to submit a proposal
      </Flex>

      {!!error && (
        <Flex color={'negative'} justify={'center'} width={'100%'} wrap={'wrap'}>
          {error}
        </Flex>
      )}

      <AnimatedModal
        open={proposing}
        close={() => {
          setProposing(false)
        }}
      >
        <SuccessModalContent
          title={'Proposal submitting'}
          subtitle={'Your Proposal is being submitted'}
          pending
        />
      </AnimatedModal>
    </Flex>
  )
}
