import PageContainer from '@/components/layout/PageContainer';
import HeaderWithButton from '@/components/PageHeaders/HeaderWithButton';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateNewGuard from './components/CreateNewGuard';
import { ArrowLeftIcon } from 'lucide-react';

const AddStreetGuard = () => {
  const navigate = useNavigate();
  return (
    <PageContainer scrollable> 
      <HeaderWithButton
        title='Add new Street Guard'
        description='Add a new Street Guard to the system'
        buttonText='Back'
        onClick={() => {
          navigate('/controller')
        }}
        icon={<ArrowLeftIcon className='mr-2 h-4 w-4' />}
      />
      <CreateNewGuard />
    </PageContainer>
  );
};

export default AddStreetGuard;
