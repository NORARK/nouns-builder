import { Flex, Stack } from '@zoralabs/zord'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useAccount } from 'wagmi'

import { useVotes } from 'src/hooks'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import {
  CreateProposalHeading,
  DropdownSelect,
  Queue,
  SelectTransactionType,
  TRANSACTION_FORM_OPTIONS,
  TRANSACTION_TYPES,
  TransactionForm,
  TransactionFormType,
  TransactionTypeIcon,
  TwoColumnLayout,
} from 'src/modules/create-proposal'
import { NextPageWithLayout } from 'src/pages/_app'
import { useDaoStore } from 'src/stores'
import { notFoundWrap } from 'src/styles/404.css'
import { AddressType } from 'src/typings'

const CreateProposalPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { query } = router
  const [transactionType, setTransactionType] = useState<
    TransactionFormType | undefined
  >()

  const { addresses } = useDaoStore()
  const { address } = useAccount()

  const { isLoading, hasThreshold } = useVotes({
    governorAddress: addresses?.governor,
    signerAddress: address,
    collectionAddress: query?.token as AddressType,
  })

  const createSelectOption = (type: TransactionFormType) => ({
    value: type,
    label: TRANSACTION_TYPES[type].title,
    icon: <TransactionTypeIcon transactionType={type} />,
  })

  const options = TRANSACTION_FORM_OPTIONS.map(createSelectOption)

  const handleDropdownOnChange = (value: TransactionFormType) => {
    setTransactionType(value)
  }

  if (isLoading) return null

  if (!hasThreshold) {
    return <Flex className={notFoundWrap}>403 - Access Denied</Flex>
  }

  return (
    <Stack
      mt={'x24'}
      mb={'x20'}
      w={'100%'}
      px={'x3'}
      style={{ maxWidth: 1060 }}
      mx="auto"
    >
      <CreateProposalHeading title={'Create Proposal'} />
      {transactionType ? (
        <TwoColumnLayout
          leftColumn={
            <Stack>
              <DropdownSelect
                value={transactionType}
                options={options}
                onChange={(value) => handleDropdownOnChange(value)}
              />
              <TransactionForm type={transactionType} />
            </Stack>
          }
          rightColumn={<Queue />}
        />
      ) : (
        <TwoColumnLayout
          leftColumn={
            <SelectTransactionType
              transactionTypes={TRANSACTION_FORM_OPTIONS}
              onSelect={setTransactionType}
            />
          }
        />
      )}
    </Stack>
  )
}

CreateProposalPage.getLayout = getDaoLayout

export default CreateProposalPage
