import { Grid } from '@zoralabs/zord'
import { useRouter } from 'next/router'
import React, { Fragment } from 'react'

import Pagination from 'src/components/Pagination'
import { ExplorePageData } from 'src/typings'

import { DaoCard } from '../DaoCard'
import { exploreGrid } from './Explore.css'
import ExploreNoDaos from './ExploreNoDaos'
import ExploreToolbar from './ExploreToolbar'

interface ExploreProps {
  daos?: ExplorePageData['daos'] | null
  pageInfo?: ExplorePageData['pageInfo'] | null
}

export const Explore: React.FC<ExploreProps> = ({ daos, pageInfo }) => {
  const router = useRouter()
  const { pathname } = router

  const handlePageBack = React.useCallback(() => {
    // user is on the first page
    if (!router.query.page)
      return {
        pathname,
        query: {
          ...router.query,
        },
      }

    // user is at least on the second page
    return Number(router.query.page) > 2
      ? {
          pathname,
          query: {
            ...router.query,
            page: Number(router.query.page) - 1,
          },
        }
      : {
          pathname,
        }
  }, [router, pathname])

  const handlePageForward = React.useCallback(() => {
    // there are more results to be fetched
    if (!pageInfo?.hasNextPage)
      return {
        pathname,
        query: {
          page: router.query.page,
        },
      }

    // user is on the first page
    if (!router.query.page)
      return {
        pathname,
        query: {
          ...router.query,
          page: 2,
        },
      }

    // user is at least on the second page
    return {
      pathname,
      query: {
        ...router.query,
        page: Number(router.query.page) + 1,
      },
    }
  }, [router, pageInfo?.hasNextPage, pathname])

  return (
    <Fragment>
      <ExploreToolbar title={'DAOs'} showSort />
      {daos?.length ? (
        <Fragment>
          <Grid className={exploreGrid}>
            {daos?.map((dao) => (
              <DaoCard
                key={dao.collectionAddress}
                tokenImage={dao.image ?? undefined}
                tokenName={dao.name ?? undefined}
                collectionAddress={dao.collectionAddress as string}
                collectionName={dao.collectionName ?? undefined}
                bid={dao.highestBidPrice ?? undefined}
                endTime={dao.endTime ?? undefined}
              />
            ))}
          </Grid>
          <Pagination
            onNext={handlePageForward}
            onPrev={handlePageBack}
            isLast={!pageInfo?.hasNextPage}
            isFirst={!router.query.page}
          />
        </Fragment>
      ) : (
        <ExploreNoDaos />
      )}
    </Fragment>
  )
}
