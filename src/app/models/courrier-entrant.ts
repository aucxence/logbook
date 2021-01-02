import { FbDate } from './fb-date';

export class CourrierEntrant {
    index: number;
    datereception: FbDate;
    dateenvoi: FbDate;
    nomemetteur: string;
    nomdestinataire: string;
    entreprise: string;
    objet: string;
    reference: string;
    avant: string;
    apres: string;
}
