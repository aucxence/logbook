import { FbDate } from './fb-date';

export class FactureDefinitive {
    index: number;
    nomentreprise: string;
    nomdestinataire: string;
    date: FbDate;
    objet: string;
    reference: string;
    avant: string;
    apres: string;
}
