import { Flex } from '@zoralabs/zord'
import { BigNumber, ethers } from 'ethers'
import React, { Fragment } from 'react'
import { useAccount, useContractReads } from 'wagmi'

import { governorAbi } from 'src/data/contract/abis'
import { ProposalState } from 'src/data/contract/requests/getProposalState'
import { Proposal } from 'src/data/subgraph/requests/proposalQuery'
import { ProposalVoteFragment as ProposalVote } from 'src/data/subgraph/sdk.generated'
import { useDaoStore } from 'src/modules/dao'
import { isProposalOpen, isProposalSuccessful } from 'src/modules/proposal'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { AddressType } from 'src/typings'

import { CancelButton } from './CancelButton'
import { ConnectWalletAction } from './ConnectWalletAction'
import { SuccessfulProposalActions } from './SuccessfulProposalActions'
import { VetoAction } from './VetoAction'
import { VoteStatus } from './VoteStatus'

interface ProposalActionsProps {
  daoName?: string
  proposal: Proposal
}

export const ProposalActions: React.FC<ProposalActionsProps> = ({
  daoName,
  proposal,
}) => {
  const { address: userAddress } = useAccount()
  const signerAddress = useLayoutStore((state) => state.signerAddress)
  const addresses = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)

  const { proposer, title, voteStart, proposalId, proposalNumber, timeCreated, state } =
    proposal

  const { data } = useContractReads({
    enabled: !!signerAddress,
    contracts: [
      {
        abi: governorAbi,
        address: addresses?.governor,
        chainId: chain.id,
        functionName: 'getVotes',
        args: [signerAddress as AddressType, BigNumber.from(timeCreated)],
      },
      {
        abi: governorAbi,
        address: addresses?.governor,
        chainId: chain.id,
        functionName: 'vetoer',
      },
    ] as const,
  })

  const shouldShowActions =
    state === ProposalState.Active || state === ProposalState.Pending || signerAddress

  if (shouldShowActions && !userAddress) return <ConnectWalletAction />
  if (!shouldShowActions || !data) return null

  const [votes, vetoer] = data

  const votesAvailable = !!votes ? votes.toNumber() : 0

  const signerVote: ProposalVote | undefined = signerAddress
    ? proposal.votes?.find(
        (vote) =>
          ethers.utils.getAddress(vote.voter) === ethers.utils.getAddress(signerAddress)
      )
    : undefined

  const proposalOpen = isProposalOpen(state)
  const isProposer =
    !!signerAddress &&
    ethers.utils.getAddress(proposer) == ethers.utils.getAddress(signerAddress)

  const isVetoer = signerAddress === vetoer

  const showCancel = proposalOpen && isProposer
  const showVeto = proposalOpen && isVetoer

  const displaySucceededActions = isProposalSuccessful(proposal.state)

  return (
    <Fragment>
      {displaySucceededActions && <SuccessfulProposalActions proposal={proposal} />}

      <Flex
        direction={{ '@initial': 'column', '@768': 'row' }}
        w={'100%'}
        align={'center'}
        justify={'space-between'}
        p={{ '@initial': 'x4', '@768': 'x6' }}
        gap={'x3'}
        borderStyle={'solid'}
        borderWidth={'normal'}
        borderColor={'border'}
        borderRadius={'curved'}
      >
        <VoteStatus
          signerVote={signerVote}
          votesAvailable={votesAvailable}
          proposalId={proposalId}
          voteStart={voteStart}
          state={state}
          daoName={daoName}
          title={title || ''}
        />

        {showCancel && <CancelButton proposalId={proposalId} />}
      </Flex>

      {showVeto && <VetoAction proposalId={proposalId} proposalNumber={proposalNumber} />}
    </Fragment>
  )
}
