export class Notification {

    CreatedBy: string;
    CreatedByName: string;
    HourTime: string;
    WorkedWith: string;
    WorkedWithName: string;
    assignedTo: string;
    assignedToName: string;
    creationDate: Date;
    discardedBy: string[];
    label: string;
    seenBy: string[];
    subtasksNumber: number;
    status: string;
    taskid: string;
    toShowTo: string[];
    type: string;

    mapping = {
        create: 'créer',
        update: 'mettre à jour',
        delete: 'supprimer'
    }

    constructor(jsonObj?) {
        if (jsonObj) {
            // tslint:disable-next-line: forin
            for (const prop in jsonObj) {
                if(prop === 'creationDate') {
                    this[prop] = new Date(jsonObj[prop] * 1000);
                } else if (prop === 'type') {
                    this[prop] = this.mapping[jsonObj[prop]];
                }
                else {
                    this[prop] = jsonObj[prop];
                }
            }
        }
    }
    
}
