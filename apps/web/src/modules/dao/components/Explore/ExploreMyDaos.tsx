import { Grid } from '@zoralabs/zord'
import { ethers } from 'ethers'
import React from 'react'
import useSWR from 'swr'

import SWR_KEYS from 'src/constants/swrKeys'
import { userDaosFilter } from 'src/data/subgraph/requests/exploreQueries'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'

import { DaoCard } from '../DaoCard'
import { exploreGrid } from './Explore.css'
import ExploreNoDaos from './ExploreNoDaos'
import { ExploreSkeleton } from './ExploreSkeleton'
import ExploreToolbar from './ExploreToolbar'

export const ExploreMyDaos = () => {
  const signerAddress = useLayoutStore((state) => state.signerAddress)
  const chain = useChainStore((x) => x.chain)

  const { data, error, isValidating } = useSWR(
    signerAddress
      ? [chain.id, SWR_KEYS.DYNAMIC.MY_DAOS_PAGE(signerAddress as string)]
      : null,
    () => userDaosFilter(chain.id, signerAddress as string),
    { revalidateOnFocus: false }
  )

  const isLoading = data ? false : isValidating && !data && !error

  return (
    <>
      <ExploreToolbar title={`My DAOs on ${chain.name}`} />
      {isLoading ? (
        <ExploreSkeleton />
      ) : data?.daos?.length ? (
        <Grid className={exploreGrid} mb={'x16'}>
          {data.daos.map((dao) => {
            const bid = dao.highestBid?.amount ?? undefined
            const bidInEth = bid ? ethers.utils.formatEther(bid) : undefined

            return (
              <DaoCard
                tokenId={dao.token?.tokenId ?? undefined}
                key={dao.dao.tokenAddress}
                tokenImage={dao.token?.image ?? undefined}
                tokenName={dao.token?.name ?? undefined}
                collectionAddress={dao.dao.tokenAddress as string}
                collectionName={dao.dao.name ?? undefined}
                bid={bidInEth}
                endTime={dao.endTime ?? undefined}
              />
            )
          })}
        </Grid>
      ) : (
        <ExploreNoDaos />
      )}
    </>
  )
}
