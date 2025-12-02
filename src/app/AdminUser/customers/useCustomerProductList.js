import { useState, useEffect } from 'react';
import * as customerApi from './api';

export const useCustomerProductList = () => {
  const [data, setData] = useState({ customers: [], products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomerProductList = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getAllCustomersAndProducts();
      setData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching customer and product list:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerProductList();
  }, []);

  return { data, loading, error, refetch: fetchCustomerProductList };
};