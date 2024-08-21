import { IAuthority, NewAuthority } from './authority.model';

export const sampleWithRequiredData: IAuthority = {
  name: 'ebb5a005-8c54-4764-9ea1-856649212a8f',
};

export const sampleWithPartialData: IAuthority = {
  name: '5c50bdcf-8657-4712-8d02-e4852524fa29',
};

export const sampleWithFullData: IAuthority = {
  name: 'd4bf7654-8873-4be7-b65e-ca8d75408545',
};

export const sampleWithNewData: NewAuthority = {
  name: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
