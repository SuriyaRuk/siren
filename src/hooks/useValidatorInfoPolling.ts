import { useRecoilValueLoadable, useSetRecoilState } from 'recoil'
import { secondsInSlot } from '../constants/constants'
import { useEffect } from 'react'
import { selectValidators } from '../recoil/selectors/selectValidators'
import { validatorStateInfo } from '../recoil/atoms'
import { Validator } from '../types/validator'
import usePollApi from './usePollApi'
import { PollingOptions } from '../types'

const useValidatorInfoPolling = (options?: PollingOptions) => {
  const { time = secondsInSlot * 1000, isReady = true } = options || {}
//  const { beaconUrl } = useRecoilValue(activeDevice)
  const { contents: validators } = useRecoilValueLoadable(selectValidators)
  const setStateInfo = useSetRecoilState(validatorStateInfo)

  // const validatorInfoUrl = `${beaconUrl}/eth/v1/beacon/states/head/validators`
  const validatorIdString = validators?.length
    ? validators.map((validator: Validator) => validator.pubKey).join(',')
    : undefined

  const { data } = usePollApi({
    key: 'validatorInfo',
    time,
    isReady: !!validatorIdString && isReady,
    url: 'http://127.0.0.1:8080/api', // Client call server. tunnel 8080 also.
    method: 'post',
    payload: {
      id: validatorIdString,
      url: 'http://192.168.100.10:5052/eth/v1/beacon/states/head/validators', // server call server use 127.0.0.1 if siren use network mode hosti. use ip nic 
    },
  })

  useEffect(() => {
    const result = data?.data
    if (result) {
      setStateInfo(result)
    }
  }, [data])
}

export default useValidatorInfoPolling
