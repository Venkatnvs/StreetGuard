import AXIOS_INSTANCE from '../axios';

export const streetgard_list = () => {
    return AXIOS_INSTANCE.get('/core/streetgard/');
};

export const streetgard_create = (data) => {
    return AXIOS_INSTANCE.post('/core/streetgard/', data);
};

export const streetgard_data_list = () => {
    return AXIOS_INSTANCE.get('/core/streetgard-data/');
};

export const streetgard_data_create = (data) => {
    return AXIOS_INSTANCE.post('/core/streetgard-data/', data);
};

export const streetgard_data_species_latest = (id) => {
    return AXIOS_INSTANCE.get(`/core/streetgard-data/${id}/species-latest/`);
};

export const streetgard_data_list_specific_device = (id) => {
    return AXIOS_INSTANCE.get(`/core/streetgard-data/${id}/`);
};  