import { color } from '@zoralabs/zord'

import { IconType } from 'src/components/Icon/icons'

export enum TransactionType {
  SEND_ETH = 'send-eth',
  AIRDROP = 'airdrop',
  CUSTOM = 'custom',
  UPGRADE = 'upgrade',
  NOUNS_CONNECT = 'nouns-connect',
}

export interface TransactionTypeProps {
  title: string
  subTitle: string
  icon: IconType
  iconBackdrop: string
  iconBorder?: boolean
}

export interface TransactionTypesPropsMap {
  [key: string]: TransactionTypeProps
}

export const TRANSACTION_TYPES = {
  [TransactionType.SEND_ETH]: {
    title: 'Send ETH',
    subTitle: 'Create a proposal to send ETH from the treasury',
    icon: 'eth',
    iconBackdrop: 'rgba(115, 17, 255, 0.1)',
  },
  [TransactionType.AIRDROP]: {
    title: 'Create an Airdrop',
    subTitle: 'Create a free Airdrop for selected addresses',
    icon: 'airdrop',
    iconBackdrop: 'rgba(28, 182, 135, 0.1)',
  },
  [TransactionType.UPGRADE]: {
    title: 'Upgrade Proposal',
    subTitle: 'Create a proposal to upgrade',
    icon: 'plus',
    iconBackdrop: color.ghostHover,
  },
  [TransactionType.CUSTOM]: {
    title: 'Custom Transaction',
    subTitle: 'Create any other kind of transaction',
    icon: 'plus',
    iconBackdrop: color.ghostHover,
  },
  [TransactionType.NOUNS_CONNECT]: {
    title: 'Use NounsConnect',
    subTitle:
      'Connect your DAO to create NFT collections, payment splits, transfer tokens and more',
    icon: 'nounsConnect',
    iconBackdrop: color.background1,
    iconBorder: true
  },
} as TransactionTypesPropsMap
