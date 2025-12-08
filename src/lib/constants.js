// Service areas for WastePickUp System
// Each area contains LGA name and corresponding zipcode
export const SERVICE_AREAS = [
    { lga: 'Nasarawa', zipcode: '700282', label: 'Nasarawa LGA (700282)' },
    { lga: 'Tarauni', zipcode: '700101', label: 'Tarauni LGA (700101)' },
    { lga: 'Kano Municipal', zipcode: '700211', label: 'Kano Municipal LGA (700211)' },
    { lga: 'Fagge', zipcode: '700213', label: 'Fagge LGA (700213)' },
    { lga: 'Dala', zipcode: '700252', label: 'Dala LGA (700252)' },
    { lga: 'Gwale', zipcode: '700103', label: 'Gwale LGA (700103)' },
    { lga: 'Ungogo', zipcode: '700105', label: 'Ungogo LGA (700105)' }
];

// Helper function to get service area by zipcode
export const getServiceAreaByZipcode = (zipcode) => {
    return SERVICE_AREAS.find(area => area.zipcode === zipcode);
};

// Helper function to get service area by LGA
export const getServiceAreaByLGA = (lga) => {
    return SERVICE_AREAS.find(area => area.lga === lga);
};
