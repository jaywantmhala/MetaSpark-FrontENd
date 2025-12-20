"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import * as orderApi from '../orders/api';

export default function InspectionQueuePage() {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [pdfMap, setPdfMap] = useState({});
    const [pdfModalUrl, setPdfModalUrl] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const orders = await orderApi.getAllOrders();

                const transformed = orders.map(order => {
                    const customer = (order.customers && order.customers[0]) || {};

                    const address = customer.billingAddress || customer.primaryAddress || '';
                    const shippingAddress = customer.shippingAddress || '';

                    return {
                        id: `SF${order.orderId}`,
                        customer: customer.companyName || customer.customerName || 'Unknown Customer',
                        products: order.customProductDetails || (order.products && order.products[0]
                            ? `${order.products[0].productCode} - ${order.products[0].productName}`
                            : 'No Product'),
                        address,
                        addressType: 'Billing',
                        shippingAddress,
                        shippingType: 'Shipping',
                        status: order.status || 'Inspection',
                        date: order.dateAdded || '',
                        department: order.department,
                    };
                });

                setOrders(transformed);
            } catch (err) {
                console.error('Error fetching orders for inspection queue:', err);
            }
        };

        fetchOrders();
    }, []);

    const filtered = useMemo(() => {
        return orders.filter(order => {
            const dept = (order.department || '').toUpperCase();
            return dept === 'INSPECTION';
        });
    }, [orders]);

    useEffect(() => {
        const fetchPdfInfo = async () => {
            try {
                const raw = typeof window !== 'undefined' ? localStorage.getItem('swiftflow-user') : null;
                if (!raw) return;
                const auth = JSON.parse(raw);
                const token = auth?.token;
                if (!token) return;

                const entries = await Promise.all(
                    orders.map(async (order) => {
                        const numericId = String(order.id).replace(/^SF/i, '');
                        if (!numericId) return [order.id, null];
                        try {
                            const resp = await fetch(`http://localhost:8080/status/order/${numericId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (!resp.ok) return [order.id, null];
                            const history = await resp.json();
                            const withPdf = Array.isArray(history)
                                ? history.find(h => h.attachmentUrl && h.attachmentUrl.toLowerCase().endsWith('.pdf'))
                                : null;
                            return [order.id, withPdf ? withPdf.attachmentUrl : null];
                        } catch {
                            return [order.id, null];
                        }
                    })
                );

                const map = {};
                entries.forEach(([id, url]) => {
                    map[id] = url;
                });
                setPdfMap(map);
            } catch {
            }
        };

        if (orders.length > 0) {
            fetchPdfInfo();
        } else {
            setPdfMap({});
        }
    }, [orders]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Inspection Queue</h1>
                <p className="text-gray-600 mt-1">Review and inspect finished products before completion.</p>
            </div>

            {/* Inspection Queue Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Inspection Queue</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product(s)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtered.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link href={`/InspectionUser/inspection-queue/${order.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                                            {order.id}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.customer}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="max-w-xs truncate" title={order.products}>
                                            {order.products}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div>
                                            <div className="font-medium">{order.address}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                <span className="inline-block bg-gray-100 px-2 py-1 rounded">{order.shippingAddress}</span>
                                                <span className="ml-1 text-gray-400">({order.shippingType})</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="space-y-1">
                                            <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                                                {order.addressType}
                                            </span>
                                            <div className="text-xs text-gray-500">
                                                <span className="inline-block bg-blue-50 px-2 py-1 rounded text-blue-700">
                                                    {order.shippingType}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {pdfMap[order.id] ? (
                                            <div className="flex items-center gap-2 text-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => setPdfModalUrl(pdfMap[order.id])}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    View
                                                </button>
                                                <a
                                                    href={pdfMap[order.id]}
                                                    download
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PDF Preview Modal */}
            {pdfModalUrl && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setPdfModalUrl(null)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
                            <div className="flex items-center justify-between p-3 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900">PDF Preview</h3>
                                <button
                                    type="button"
                                    onClick={() => setPdfModalUrl(null)}
                                    className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="flex-1">
                                <iframe
                                    src={pdfModalUrl}
                                    className="w-full h-full rounded-b-lg"
                                    title="PDF Preview"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Order {selectedOrder.id} Details</h3>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-sm text-gray-500">Customer:</dt>
                                            <dd className="text-sm text-gray-900">{selectedOrder.customer}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-gray-500">Order Date:</dt>
                                            <dd className="text-sm text-gray-900">{selectedOrder.date}</dd>
                                        </div>
                                    </dl>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-sm text-gray-500">Product(s):</dt>
                                            <dd className="text-sm text-gray-900">{selectedOrder.products}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm text-gray-500">Status:</dt>
                                            <dd>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    {selectedOrder.status}
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Address Information</h4>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-3 rounded">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-500">BILLING ADDRESS</span>
                                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">{selectedOrder.addressType}</span>
                                        </div>
                                        <p className="text-sm text-gray-900">{selectedOrder.address}</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-blue-700">SHIPPING ADDRESS</span>
                                            <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">{selectedOrder.shippingType}</span>
                                        </div>
                                        <p className="text-sm text-blue-900">{selectedOrder.shippingAddress}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                                    Approve Inspection
                                </button>
                                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                                    Reject Inspection
                                </button>
                                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
                                    Request Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
  
  );
}
