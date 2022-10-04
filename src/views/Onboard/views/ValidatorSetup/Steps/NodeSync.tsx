import { useSetRecoilState } from 'recoil';
import { appView, setupStep } from '../../../../../recoil/atoms';
import { AppView, SetupSteps } from '../../../../../constants/enums';
import ValidatorSetupLayout from '../../../../../components/ValidatorSetupLayout/ValidatorSetupLayout';
import SyncCard from '../../../../../components/SyncCard/SyncCard';
import Typography from '../../../../../components/Typography/Typography';
import ViewDisclosures from '../../../../../components/ViewDisclosures/ViewDisclosures';
import { Suspense } from 'react';
import BeaconSyncCard from '../../../../../components/BeaconSyncCard/BeaconSyncCard';
import SyncCardFallback from '../../../../../components/SyncCard/SyncCardFallback';

const NodeSync = () => {
  const setView = useSetRecoilState(appView)
  const setStep = useSetRecoilState(setupStep)

  const viewHealth = () => setStep(SetupSteps.HEALTH)

  const viewDashBoard = () => setView(AppView.DASHBOARD)

  return (
    <ValidatorSetupLayout
      onNext={viewDashBoard}
      onStepBack={viewHealth}
      previousStep='Health Check'
      currentStep='Syncing'
      title='Syncing'
      ctaText='Continue'
      mediaQuery='@1200:overflow-hidden @1200:py-0 @1200:px-0 @1024:flex @1024:items-start @1024:justify-center @1200:items-center'
    >
      <div className='w-full flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:space-x-2'>
        <SyncCard
          title='Ethereum Mainnet'
          subTitle='Geth Node'
          timeRemaining='0H 0M'
          status='No connection'
          progress={0}
        />
        <Suspense fallback={<SyncCardFallback/>}>
          <BeaconSyncCard/>
        </Suspense>
      </div>
      <div className='w-full border border-dark100 mt-4 space-y-4 p-4'>
        <Typography isBold type='text-caption1' className='uppercase'>
          Syncing <br />
          overview —
        </Typography>
        <Typography color='text-dark300'>
          You are currently syncing to the Ethereum Geth and Beacon node. This may take a while...
        </Typography>
        <ViewDisclosures />
      </div>
    </ValidatorSetupLayout>
  )
}

export default NodeSync