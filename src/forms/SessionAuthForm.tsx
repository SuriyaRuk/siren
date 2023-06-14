import { FC, ReactElement } from 'react'
import { Control, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { sessionAuthValidation } from '../validation/sessionAuthValidation'
import { OnboardView } from '../constants/enums'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { apiToken, onBoardView } from '../recoil/atoms'
import useLocalStorage from '../hooks/useLocalStorage'
import CryptoJS from 'crypto-js'
import { useTranslation } from 'react-i18next'
import displayToast from '../utilities/displayToast'

export interface SessionAuthForm {
  password: string
  password_confirmation: string
}

export interface RenderProps {
  control: Control<SessionAuthForm>
  isLoading: boolean
  onSubmit: () => void
}

export interface SessionAuthFormProps {
  children: (props: RenderProps) => ReactElement
}

const SessionAuthForm: FC<SessionAuthFormProps> = ({ children }) => {
  const { t } = useTranslation()
  const setView = useSetRecoilState(onBoardView)
  const viewSetup = () => setView(OnboardView.SETUP)
  const token = useRecoilValue(apiToken)
  const [, storeApiToken] = useLocalStorage<string>('api-token', '')

  const {
    control,
    watch,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      password: '',
      password_confirmation: '',
    },
    mode: 'onChange',
    resolver: yupResolver(sessionAuthValidation),
  })

  const password = watch('password')

  const onSubmit = () => {
    if (!password) {
      viewSetup()
      return
    }
    if (!isValid && password) {
      displayToast(t('error.sessionAuth.invalidPassword'), 'error')
      return
    }

    storeApiToken(CryptoJS.AES.encrypt(token, password).toString())
    viewSetup()
  }

  return (
    <form className='w-full h-full' action=''>
      {children &&
        children({
          control,
          isLoading: false,
          onSubmit,
        })}
    </form>
  )
}

export default SessionAuthForm