import PageContainer from '@/components/layout/PageContainer';
import TextHeader from '@/components/PageHeaders/TextHeader';
import React from 'react';
import MapDisplay from './components/MapDisplay';

const Home = () => {
  return (
    <PageContainer scrollable>
      <TextHeader title='All Street Guard' description='Overview of all Street Guard' />
      <MapDisplay />
    </PageContainer>
  )
};

export default Home;