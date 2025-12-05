import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { FormInput, FormSelect } from './inputs/FormInput';
import { SERVICE_AREAS } from '../../constants/serviceAreas';

// pricing for bin orders (buying bins)
const ORDER_PRICES = [
    { value: '50', label: '50 Litres', price: 5000, image: '/bin-50l.png', description: 'Perfect for small households or minimal waste' },
    { value: '120', label: '120 Litres', price: 8500, image: '/bin-120l.png', description: 'Ideal for average households and regular use' },
    { value: '240', label: '240 Litres', price: 15000, image: '/bin-240l.png', description: 'Best for large households or commercial use' }
];

// pricing for pickups (waste collection)
const PICKUP_PRICES = [
    { value: '50', label: '50 Litres', price: 1500 },
    { value: '120', label: '120 Litres', price: 3000 },
    { value: '240', label: '240 Litres', price: 5000 }
];

// Handles both bin orders and pickup requests
export default function ServiceForm({ type, onSubmit, userData }) {
    const isOrder = type === 'order';
    const prices = isOrder ? ORDER_PRICES : PICKUP_PRICES;
    
    const [form, setForm] = useState({
        address: '',
        serviceArea: '',
        contactPhone: '',
        quantity: 1,
        binSize: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [total, setTotal] = useState(0);

    // recalculate total when bin size or quantity changes
    useEffect(() => {
        const bin = prices.find(b => b.value === form.binSize);
        setTotal(bin ? bin.price * form.quantity : 0);
    }, [form.binSize, form.quantity, prices]);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.address.trim()) errs.address = `${isOrder ? 'Delivery' : 'Pickup'} address is required`;
        if (!form.serviceArea) errs.serviceArea = 'Service area is required';
        if (!form.binSize) errs.binSize = 'Bin size is required';
        if (form.quantity < 1) errs.quantity = 'Quantity must be at least 1';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const area = SERVICE_AREAS.find(a => a.zipcode === form.serviceArea);
        const phone = form.contactPhone.trim() || userData?.phone || '';

        setSubmitting(true);
        try {
            // build the data object based on form type
            const data = {
                [isOrder ? 'deliveryAddress' : 'pickupAddress']: form.address,
                zipcode: area.zipcode,
                lga: area.lga,
                contactPhone: phone,
                quantityOfBin: form.quantity,
                binLitre: form.binSize,
                amount: total,
                ...(isOrder && form.notes && { notes: form.notes })
            };
            await onSubmit(data);
            // reset form after success
            setForm({ address: '', serviceArea: '', contactPhone: '', quantity: 1, binSize: '', notes: '' });
            setTotal(0);
        } catch (err) {
            console.error('Form submit failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setForm({ address: '', serviceArea: '', contactPhone: '', quantity: 1, binSize: '', notes: '' });
        setTotal(0);
    };

    const selectedBin = prices.find(b => b.value === form.binSize);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* show user info at top */}
            {userData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                            <Icon icon="hugeicons:user" className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{userData.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon icon="hugeicons:mail-01" className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{userData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon icon="hugeicons:call" className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{userData.phone}</span>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* location section */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        {isOrder ? 'Delivery Location' : 'Pickup Location'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label={isOrder ? 'Delivery Address' : 'Pickup Address'}
                            value={form.address}
                            onChange={(e) => updateField('address', e.target.value)}
                            error={errors.address}
                            placeholder="Enter full address"
                            className="md:col-span-2"
                            required
                        />
                        <FormSelect
                            label="Select Service Area"
                            value={form.serviceArea}
                            onChange={(e) => updateField('serviceArea', e.target.value)}
                            error={errors.serviceArea}
                            options={SERVICE_AREAS.map(a => ({ value: a.zipcode, label: a.label }))}
                            required
                        />
                        <FormInput
                            label="Contact Phone (Optional)"
                            type="tel"
                            value={form.contactPhone}
                            onChange={(e) => updateField('contactPhone', e.target.value)}
                            error={errors.contactPhone}
                            placeholder={userData?.phone || "Enter contact phone"}
                            helperText="Leave blank to use your profile phone number"
                        />
                    </div>
                </div>

                {/* bin details section */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Bin Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelect
                            label="Bin Size"
                            value={form.binSize}
                            onChange={(e) => updateField('binSize', e.target.value)}
                            error={errors.binSize}
                            options={prices}
                            required
                        />
                        <FormInput
                            label="Quantity of Bins"
                            type="number"
                            min="1"
                            value={form.quantity}
                            onChange={(e) => updateField('quantity', parseInt(e.target.value) || 1)}
                            error={errors.quantity}
                            placeholder="1"
                            required
                        />
                    </div>

                    {/* bin product card (only for orders) */}
                    {isOrder && selectedBin && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                                    <img 
                                        src={selectedBin.image} 
                                        alt={selectedBin.label}
                                        className="w-20 h-20 object-contain"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900">{selectedBin.label} Waste Bin</h4>
                                    <p className="text-xs text-gray-600 mt-1">{selectedBin.description}</p>
                                    <div className="mt-2 flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Icon icon="hugeicons:checkmark-circle-02" className="w-4 h-4 text-green-600" />
                                            <span className="text-xs text-gray-600">Durable wheels</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Icon icon="hugeicons:checkmark-circle-02" className="w-4 h-4 text-green-600" />
                                            <span className="text-xs text-gray-600">Weather resistant</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Icon icon="hugeicons:checkmark-circle-02" className="w-4 h-4 text-green-600" />
                                            <span className="text-xs text-gray-600">Secure lid</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* payment summary */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Summary</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{isOrder ? 'Bin Price' : 'Bin Size Price'}</span>
                            <span className="font-medium text-gray-900">
                                {form.binSize ? `₦${prices.find(b => b.value === form.binSize)?.price.toLocaleString()}` : '₦0'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Quantity</span>
                            <span className="font-medium text-gray-900">{form.quantity}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total Amount</span>
                            <span className="text-lg font-bold text-primary">₦{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Icon icon="hugeicons:loading-01" className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>Proceed to Payment</span>
                                <Icon icon="hugeicons:arrow-right-01" className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
