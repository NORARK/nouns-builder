import { keyframes, style } from '@vanilla-extract/css'
import { atoms } from '@zoralabs/zord'

export const feed = style([
  atoms({
    m: 'auto',
  }),
  {
    maxWidth: 912,
  },
])

export const feedLayoutWrapper = style({
  height: '500px',

  overflowY: 'auto',
  gridGap: '0.5rem',
  '@media': {
    'screen and (max-width: 1080px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    'screen and (max-width: 768px)': {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
})

export const castCardStyle = style({})

const pulse = keyframes({
  '0%': { opacity: '1' },
  '100%': { opacity: '1' },
  '50%': { opacity: '.5' },
})

export const cardSkeleton = style({
  animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
})
