import { debounce } from 'lodash'
import * as Yup from 'yup'

import { CHAIN_ID } from 'src/typings'
import { isValidAddress } from 'src/utils/ens'
import { getProvider } from 'src/utils/provider'

const validateAddress = async (
  value: string | undefined,
  res: (value: boolean | PromiseLike<boolean>) => void
) => {
  try {
    res(!!value && (await isValidAddress(value, getProvider(CHAIN_ID.ETHEREUM))))
  } catch (err) {
    res(false)
  }
}

export const deboucedValidateAddress = async (value: string | undefined) => {
  const debouncedFn = debounce(validateAddress, 500)
  return await new Promise<boolean>((res) => debouncedFn(value, res))
}

export const allocationSchema = Yup.object().shape({
  founderAddress: Yup.string()
    .test('isValidAddress', 'invalid address', deboucedValidateAddress)
    .required('*'),
  allocationPercentage: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('*')
    .integer('Must be whole number')
    .max(100, '< 100')
    .when('admin', (admin, schema) => {
      if (!admin) return schema.min(1, '> 0') // (condition, errorMessage) - allocation represented as % must be greater than or equal to 0
      return schema
    }),
  endDate: Yup.string()
    .required('*')
    .test('isDateInFuture', 'Must be in future', (value: string | undefined) => {
      if (!value) return false
      const date = new Date(value)
      const now = new Date()
      return date > now
    }),
  admin: Yup.boolean(),
})

export const validationSchemaContributions = Yup.object().shape({
  builderAllocation: Yup.object().when({
    is: (exists: object | undefined) => !!exists,
    then: allocationSchema,
  }),
  nounsAllocation: Yup.object().when({
    is: (exists: object | undefined) => !!exists,
    then: allocationSchema,
  }),
})

export const validationSchemaFounderAllocation = (signerAddress: string | null) =>
  Yup.object().shape({
    founderAllocation: Yup.array()
      .of(allocationSchema)
      .min(1, 'Founder is required')
      .test(
        'founderAddress',
        'The founder must be the connected wallet.',
        function (value) {
          if (value?.[0]) {
            return value?.[0]['founderAddress'] === signerAddress
          }
          return false
        }
      )
      .test(
        'unique',
        'Founder allocation addresses should be unique.',
        function (values) {
          const addresses = values?.map((v) => v.founderAddress)
          return values?.length === new Set(addresses)?.size
        }
      ),
  })
