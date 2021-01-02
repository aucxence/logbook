import { v4 as uuidv4 } from 'uuid';
import { Task } from './task';
import { Subtask } from './subtask';

export class FirebaseTask {
    taskid: string;
    label: string;

    assignerId: string;
    assignerName: string;

    assignedTo: string;
    assignedToName: string;

    projectId: string;
    ProjectTitle: string;
    projectStatus: boolean;

    creationDate: any;
    deadline: any;
    description: string;

    subtasks: Subtask[]=[];

    subtasksNumber: number;

    completed: boolean;

    progress: number;

    status: string;

    CreatedBy: string;
    CreatedByName: string ;

    ApprovedBy: string;
    ApprovedByName: string;
    WorkedWith: string;
    WorkedWithName: string;

    repeat: boolean;
    every: number;
    period: string;
    monthlyOption: string;

    startingDate: any;
    startingMonth: number;
    startingYear: any;

    HourTime: string;
    weekdays: number[];
    monthday: number;
    dayOrder: number;
    dayofweek: number;

    cronjob: string;

    turnintoTask(): Task {
        const { taskid, label, assignerId, assignerName,
            assignedTo, assignedToName, projectId, ProjectTitle,
            projectStatus, creationDate, deadline, description,
            subtasks, subtasksNumber, completed, progress, status,
            CreatedBy,CreatedByName, ApprovedBy, ApprovedByName, WorkedWith, WorkedWithName, 
            repeat, every, period, monthlyOption,
            startingDate, startingMonth, startingYear, HourTime,
            weekdays, monthday, dayOrder, dayofweek } = this;

        const data = { taskid, label, assignerId, assignerName,
            assignedTo, assignedToName, projectId, ProjectTitle,
            projectStatus, creationDate, deadline, description,
            subtasks, subtasksNumber, completed, progress, status,
            CreatedBy, CreatedByName, ApprovedBy, ApprovedByName, WorkedWith, WorkedWithName,
            repeat, every, period, monthlyOption,
            startingDate, startingMonth, startingYear, HourTime,
            weekdays, monthday, dayOrder, dayofweek };

        data.creationDate = new Date(data.creationDate.seconds * 1000);
        data.deadline = new Date(data.deadline.seconds * 1000);
        data.startingDate = new Date(data.startingYear.seconds * 1000);
        data.startingYear = new Date(data.startingYear.seconds * 1000);

        return new Task(data);
    }

    addSubTask(currentsubtask) {
        this.subtasks.push({
            task: currentsubtask,
            completed: this.completed
        });
        currentsubtask = '';

        this.progress = 0;
        let progress = 0;
        this.completed = true;

        this.subtasks.forEach((subtask) => {
            progress = progress + (subtask.completed === true ? 100 : 0);
            this.completed = this.completed && subtask.completed;
        });
        this.subtasksNumber = this.subtasks.length;

        this.progress = progress / this.subtasks.length;

        if (this.completed === true) {
            this.status = 'done';
        } else if (this.progress > 0) {
            this.status = 'ongoing';
        } else {
            this.status = 'undone';
        }

        return currentsubtask;
    }

    toggleSubtaskStatus(i: number) {
        this.subtasks[i].completed = !this.subtasks[i].completed;

        this.progress = 0;
        let progress = 0;
        this.completed = true;
        this.subtasks.forEach((subtask) => {
            progress = progress + (subtask.completed === true ? 100 : 0);
            this.completed = this.completed && subtask.completed;
        });
        this.progress = progress / this.subtasks.length;
        this.subtasksNumber = this.subtasks.length;

        if (this.completed === true) {
            this.status = 'done';
        } else if (this.progress > 0) {
            this.status = 'ongoing';
        } else {
            this.status = 'undone';
        }
    }

    toggleTaskStatus(i: number) {
        this.completed = !this.completed;
        this.progress = this.progress === 100 ? 0 : 100;

        this.subtasks.forEach((subtask) => {
            subtask.completed = this.completed;
        });

        if (this.completed === true) {
            this.status = 'done';
        } else if (this.progress > 0) {
            this.status = 'ongoing';
        } else {
            this.status = 'undone';
        }
    }

    deleteSubtask(i) {
        this.subtasks.splice(i, 1);

        let progress = 0;
        this.completed = this.subtasks.length === 0 ? this.completed : true;
        this.subtasks.forEach((subtask) => {
            progress = progress + (subtask.completed === true ? 100 : 0);
            this.completed = this.completed && subtask.completed;
        });

        this.progress = this.subtasks.length === 0
            ? this.progress
            : progress / this.subtasks.length;

        this.subtasksNumber = this.subtasks.length;

        if (this.completed === true) {
            this.status = 'done';
        } else if (this.progress > 0) {
            this.status = 'ongoing';
        } else {
            this.status = 'undone';
        }
    }
}
