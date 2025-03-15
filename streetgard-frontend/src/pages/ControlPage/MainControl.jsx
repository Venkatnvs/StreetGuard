import PageContainer from '@/components/layout/PageContainer';
import HeaderWithButton from '@/components/PageHeaders/HeaderWithButton';
import { Plus } from 'lucide-react';
import React from 'react';
import StreetGardList from './components/streetGardList';
import { useNavigate } from 'react-router-dom';

const MainControl = () => {
  const navigate = useNavigate();
  return (
    <PageContainer scrollable> 
      <HeaderWithButton
        title='List of Street Guard'
        description='List of all Street Guard'
        buttonText='Add Street Guard'
        onClick={() => {
          navigate('/add-streetguard');
        }}
        icon={<Plus className='mr-2 h-4 w-4' />}
      />
      <StreetGardList />
    </PageContainer>
  );
};

export default MainControl;
