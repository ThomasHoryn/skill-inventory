import { IUser } from './user.model';

export const sampleWithRequiredData: IUser = {
  id: 20467,
  login: 'l6nw',
};

export const sampleWithPartialData: IUser = {
  id: 494,
  login: 'I',
};

export const sampleWithFullData: IUser = {
  id: 12059,
  login: '${`~K@N37PZO\\7d\\uNuYBw4',
};
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
