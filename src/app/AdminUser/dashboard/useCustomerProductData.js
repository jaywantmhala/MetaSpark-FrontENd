import { useState, useEffect } from 'react';
import * as customerApi from '../customers/api';
import * as productApi from '../products/api';

export const useCustomerProductData = () => {
  const [customerData, setCustomerData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomerProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch customers and products in parallel
      const [customers, products] = await Promise.all([
        customerApi.getAllCustomers(),
        productApi.getAllProducts()
      ]);
      
      setCustomerData(Array.isArray(customers) ? customers : []);
      setProductData(Array.isArray(products) ? products : []);
    } catch (err) {
      console.error('Error fetching customer and product data:', err);
      setError(err.message || 'Failed to fetch customer and product data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerProductData();
  }, []);

  return { customerData, productData, loading, error, refetch: fetchCustomerProductData };
};