import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Icon } from '@iconify/react';
import { adminService } from '../../services/adminService';
import { FormInput } from '../../components/common/FormInput';
import SuccessBox from '../../components/common/SuccessBox';

export default function Settings() {
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    


    // Pricing state - matches the structure expected by ServiceForm
    const [pickupPrices, setPickupPrices] = useState([
        { value: '50', label: '50 Litres', price: 1500 },
        { value: '120', label: '120 Litres', price: 3000 },
        { value: '240', label: '240 Litres', price: 5000 }
    ]);

    const [orderPrices, setOrderPrices] = useState([
        { value: '50', label: '50 Litres', price: 5000 },
        { value: '120', label: '120 Litres', price: 8500 },
        { value: '240', label: '240 Litres', price: 15000 }
    ]);

    // Fetch pricing from Firebase on mount
    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const data = await adminService.getPricingSettings();
                if (data.pickupPrices) setPickupPrices(data.pickupPrices);
                if (data.orderPrices) setOrderPrices(data.orderPrices);
            } catch (error) {
                console.error('Error fetching pricing:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPricing();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminService.updatePricingSettings({
                pickupPrices,
                orderPrices
            });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };



    // Update pickup price for a specific bin size
    const updatePickupPrice = (index, newPrice) => {
        const updated = [...pickupPrices];
        updated[index].price = parseInt(newPrice) || 0;
        setPickupPrices(updated);
    };

    // Update order price for a specific bin size
    const updateOrderPrice = (index, newPrice) => {
        const updated = [...orderPrices];
        updated[index].price = parseInt(newPrice) || 0;
        setOrderPrices(updated);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Icon icon="hugeicons:loading-03" className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-md font-medium text-gray-900">Settings</h1>

                </div>

                <SuccessBox 
                    show={showSuccess} 
                    onClose={() => setShowSuccess(false)}
                    title="Settings Saved!"
                    message="Your changes have been updated successfully. Prices will reflect in user forms immediately."
                />



                {/* Pickup Pricing container*/}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        
                            <h2 className="text-sm font-medium text-gray-700">Pickup Service Pricing</h2>
                     
                    
                    </div>

                    <div className="space-y-4">
                        {pickupPrices.map((item, index) => (
                            <div key={item.value} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Icon icon="hugeicons:clean" className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-500">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">₦</span>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updatePickupPrice(index, e.target.value)}
                                        className="w-32 h-10 px-3 rounded-lg border border-gray-200 text-sm text-right focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bin Order Pricing container*/}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                       
                        <div>
                            <h2 className="text-sm font-medium text-gray-700">Bin Order Service Pricing</h2>
                           
                        </div>
                    </div>

                    <div className="space-y-4">
                        {orderPrices.map((item, index) => (
                            <div key={item.value} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Icon icon="hugeicons:waste" className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-500">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">₦</span>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updateOrderPrice(index, e.target.value)}
                                        className="w-32 h-10 px-3 rounded-lg border border-gray-200 text-sm text-right focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Icon icon="hugeicons:loading-03" className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <span>Save Changes</span>
                        )}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
