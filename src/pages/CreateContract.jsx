// src/pages/CreateContract.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContractForm from '../components/ContractForm';

const CreateContract = () => {
  const { bidId } = useParams(); // Get bidId from the URL

  const [error, setError] = useState('');

  useEffect(() => {
    if (!bidId) {
      setError('Invalid Bid ID.');
    }
  }, [bidId]);

  if (error) {
    return (
      <div className="container mx-auto py-10 px-6">
        <h2 className="text-3xl font-bold text-center mb-6">Error</h2>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-center text-3xl py-10">Create Contract</h1>
      <ContractForm bidId={bidId} />
    </div>
  );
};

export default CreateContract;
