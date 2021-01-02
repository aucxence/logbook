import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { } from 'firebase';
import { User } from '../models/user';

import { Response, ResponseCode } from '../models/response';
import * as firebase from 'firebase';
import { BehaviorSubject, Observable } from 'rxjs';
import { rejects } from 'assert';


@Injectable({ providedIn: 'root' })
export class AuthService {

  public currentUser: firebase.User;

  public user = new User();

  public fadeOut = false;

  alltasks: any[] = [];
  allusers: User[] = [];
  executions: any[] = [];
  assignedtasks: any[] = [];

  constructor(private _auth: AngularFireAuth, private _firestore: AngularFirestore) {
    this.LoginStatusChange().then(e => {
      this.currentUser = e as firebase.User;
      this.user.email = '';
      // console.log(e)
    });
  }

  SignIn(user: User): Promise<Response> {

    this.user = user;

    return new Promise((success, wrong) => {
      this._auth.signInWithEmailAndPassword(user.email, user.password).then(async result => {
        this.currentUser = result.user;
        if (result.user.emailVerified) {
          let _response: Response = new Response();
          _response.code = ResponseCode.Success;
          _response.message = 'Connexion réussie';
          this.StatusChange(true);
          this.GetUser().then((userpromised) => {
            this.user = userpromised;
            success(_response);
          });
        } else {
          let _response: Response = new Response();
          _response.code = ResponseCode.Error;
          _response.message = 'Svp vérifiez votre compte en cliquant sur le lien dans votre boite mail';
          wrong(_response);
        }
      }).catch(err => {
        let _response: Response = new Response();
        _response.code = err.code;
        _response.message = err.message as string;
        wrong(_response);
      });
    });

  }

  register(user: User): Promise<Response> {

    this.user = user;

    // console.log(this.user);

    return new Promise((resolve, reject) => {
      this._auth.createUserWithEmailAndPassword(user.email, user.password).then((result) => {

        result.user.sendEmailVerification().then(() => {
          let _response: Response = new Response();
          _response.code = ResponseCode.Success;
          _response.message = 'Email de vérification envoyé';

          this.DisplayNameAndPictureChange(
            'https://cdn1.iconfinder.com/data/icons/social-messaging-productivity-1-1/128/gender-male2-512.png',
            user.firstname + ' ' + user.lastname,
          );

          resolve(_response);
        }).catch(err => {
          let _response: Response = new Response();
          _response.code = err.code;
          _response.message = err.message as string;
          reject(_response);
        });

        // console.log(result);
        // this.SignIn(user).then(e => {
        //   let _response: Response = new Response();
        //   _response.code = ResponseCode.Success;
        //   _response.message = 'Inscription et connexion réussies';

        //   this.DisplayNameAndPictureChange('https://cdn1.iconfinder.com/data/icons/social-messaging-productivity-1-1/128/gender-male2-512.png');

        //   resolve(_response);
        // }).catch(err => reject(err));

      }).catch(err => {
        let _response: Response = new Response();
        _response.code = err.code;
        _response.message = err.message as string;
        reject(_response);
      });
    });
  }

  isLogin() {
    // console.log(this._auth.currentUser);
    return new Promise((resolve, reject) => {
      this.LoginStatusChange().then(e => { resolve(e != null); }).catch(p => { console.log(p); reject(p) });
    });
    // return this._auth.currentUser != null ? true : false;
  }

  LoginStatusChange() {
    return new Promise((resolve, reject) => {
      this._auth.onAuthStateChanged(e => {
        // this._firestore.doc(`users/${this._auth.currentUser.uid}`).set({ status: true }, { merge: true }).then(() => {
        resolve(e);
        // })
      }, err => {
        reject(err);
      });
    });
  }

  SingOut() {

    return new Promise((resolve, reject) => {
      // console.warn("log-off");
      this._auth.signOut().then((result) => {
        // console.log(result);

        let _response: Response = new Response();
        _response.code = ResponseCode.Success;
        _response.message = 'Déconnexion réussi';
        resolve(_response);

      }).catch(err => {
        let _response: Response = new Response();
        _response.code = err.code;
        _response.message = err.message as string;
        reject(_response)
      });
    });


  }

  StatusChange(state: boolean): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (state) {
        // tslint:disable-next-line: max-line-length
        this._firestore.doc(`users/${(await this._auth.currentUser).uid}`)
          .set(
            JSON.parse(JSON.stringify({ status: state })),
            { merge: true })
          .then((e) => resolve())
          .catch(e => reject());
      }
      else {
        // tslint:disable-next-line: max-line-length
        this._firestore.doc(`users/${(await this._auth.currentUser).uid}`)
          .set(
            JSON.parse(JSON.stringify({ status: state, logOutDate: new Date() })),
            { merge: true })
          .then((e) => resolve())
          .catch(e => reject());

      }

    });
  }

  async DisplayNameAndPictureChange(imageUrl: string, displayName: string = '') {

    // console.log("user:", this._auth.currentUser.uid);
    displayName = displayName === '' ? (await this._auth.currentUser).displayName : displayName;

    (await this._auth.currentUser).updateProfile({
      photoURL: imageUrl,
      displayName
    }).then(async e => {
      // console.log("e", e);
      const user = new User();

      user.id = (await this._auth.currentUser).uid;
      user.email = this.user.email;
      user.firstname = this.user.firstname;
      user.lastname = this.user.lastname;
      user.projects = this.user.projects;
      user.fonction = this.user.fonction;
      user.status = true;
      user.modules = [
        'tasks'
      ]
      // user.picture = (await this._auth.currentUser).photoURL;

      // console.log(e);
      this.UpdateProfile(user).catch(err => {
        // console.log('err', err);
        // this.CreateProfile(user);


      });
    });
  }

  // CreateProfile(user: MemberUser): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this._firestore.collection("users").add(JSON.parse(JSON.stringify(user))).then(e => {
  //       let _response: Response = new Response();
  //       _response.code = ResponseCode.Success;
  //       _response.message = "Kayıt işlemi başarılı.";
  //       resolve(_response);
  //     }).catch(err => {
  //       let _response: Response = new Response();
  //       _response.code = ResponseCode.Error;
  //       _response.message = err.message;
  //       reject(_response);
  //     });
  //   })
  // }

  UpdateProfile(user: User): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // this._firestore.collection("users", ref => ref.where("email", "==", this.currentUser.email)).snapshotChanges().subscribe(doc => {
      this._firestore.doc(`users/${(await this._auth.currentUser).uid}`).set(JSON.parse(JSON.stringify(user)), { merge: true }).then(e => {
        let _response: Response = new Response();
        _response.code = ResponseCode.Success;
        _response.message = 'Mise à jour de profil réussi';
        resolve(_response);
      }).catch(err => {
        let _response: Response = new Response();
        _response.code = ResponseCode.Error;
        _response.message = err.message;
        reject(_response);
      });
    })

  }




  async GetUser(): Promise<User> {
    return new Promise(async (resolve, reject) => {
      this._firestore.doc(`users/${(await this._auth.currentUser).uid}`).get().subscribe(e => {
        console.log(e.data());
        resolve(e.data() as User);
      });
    });
  }

  GetAllUsers(): Promise<Observable<DocumentChangeAction<unknown>[]>> {
    return new Promise((resolve, reject) => {
      resolve(this._firestore.collection(`users`, ref => {
        return ref.orderBy('firstname');
      }).snapshotChanges());

    })
  }

  getRelevantTasks = () => {
    const getRelevantTasks = firebase.functions().httpsCallable('getRelevantTasks');

    const today = new Date();
    const lastthirtydays = new Date();

    lastthirtydays.setDate(lastthirtydays.getDate() - 30);

    // console.log(lastthirtydays + ' -- ' + today);

    return getRelevantTasks({
      beginningDate: lastthirtydays.toDateString(),
      endingDate: today.toDateString(),
    });
  }

  createBulkTasksForItesses = () => {
    const createItessesTasks = firebase.functions().httpsCallable('createItessesTasks');

    const today = new Date();
    const lastthirtydays = new Date();

    lastthirtydays.setDate(lastthirtydays.getDate() - 30);

    // console.log(lastthirtydays + ' -- ' + today);

    return createItessesTasks({
      CreatedBy: this.user.id,
      CreatedByName: this.user.firstname + ' ' + this.user.lastname,
      fonction: this.user.fonction
    });
  }

  initTasks(): Promise<Response> {

    return new Promise((resolve, reject) => {
      // tslint:disable-next-line: variable-name
      const _response: Response = new Response();
      _response.code = ResponseCode.Success;
      _response.message = 'Chargement des tâches réussi';

      this.getRelevantTasks().then((val) => {
        this.alltasks = val.data.tasks;
        resolve(_response);
      })
        .catch(err => {
          _response.code = ResponseCode.Error;
          _response.message = err.message as string;
          reject(err);
        });
    });

  }

  getLiveRelevantTasks(data: any) {
    const bgn = new Date(data.beginningDate);
    // console.log('----> ' + JSON.stringify(data.beginningDate));
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    // console.log('----> ' + JSON.stringify(data.endingDate));
    end.setHours(24, 0, 0, 0);

    // console.log(bgn + ' -- ' + end);

    return this._firestore.collection('tasks', ref => {
      let request = ref.where('creationDate', '>=', bgn)
        .where('creationDate', '<=', end)
        .where('assignedTo', '==', this.currentUser.uid);

      if (data.taskOption) {
        if (data.taskOption === 'spontaneous') {
          request = request.where('repeat', '==', false);
        } else if (data.taskOption === 'scheduled') {
          request = request.where('repeat', '==', true);
        } else if (data.taskOption === 'newlyAdded') {
          const sevendaysago = (date: Date) => {
            const d = new Date(date);
            d.setDate(d.getDate() - 7);
            return d;
          }

          const begdate: Date = sevendaysago(new Date());
          begdate.setHours(0, 0, 0, 0);
          const today: Date = new Date();
          today.setHours(24, 0, 0, 0);

          request = request
            .where('startingDate', '>=', begdate)
            .where('startingDate', '<=', today);
        } else {
          request = request.where('status', '==', data.taskOption)
        }
      }

      return request.orderBy('creationDate', 'desc');
    }).snapshotChanges();
  }

  getLiveTasks() {
    const today = new Date();
    today.setDate(today.getDate() + 30);
    today.setHours(23, 59, 59, 999);

    const lastthirtydays = new Date();
    lastthirtydays.setDate(lastthirtydays.getDate() - 30);
    lastthirtydays.setHours(0, 0, 0, 0);

    return this.getLiveRelevantTasks({
      beginningDate: lastthirtydays.toDateString(),
      endingDate: today.toDateString(),
    });
  }

  saveTask(task): Promise<Response> {
    return new Promise((resolve, reject) => {
      // tslint:disable-next-line: variable-name
      const _response: Response = new Response();
      _response.code = ResponseCode.Success;
      _response.message = 'Enregistrement réussi';

      this._firestore.collection('tasks').doc(task.taskid).set(task).then(ref => {
        resolve(_response);
      }).catch(err => {
        _response.code = ResponseCode.Error;
        _response.message = err.message;
        reject(_response);
      });
    });
  }

  updateTaskStatus(task): Promise<Response> {
    return new Promise((resolve, reject) => {
      // tslint:disable-next-line: variable-name
      const _response: Response = new Response();
      _response.code = ResponseCode.Success;
      _response.message = 'Enregistrement réussi';


      this._firestore.collection('tasks').doc(task.taskid).update({
        status: task.status,
        progress: task.progress,
        subtasks: task.subtasks,
        subtasksNumber: task.subtasks.length,
        HourTime: task.HourTime,
        deadline: task.deadline
      }).then(ref => {
        resolve(_response);
      }).catch(err => {
        _response.code = ResponseCode.Error;
        _response.message = err.message;
        reject(_response);
      });
    });
  }

  getLiveNotifications(data: any) {
    const bgn = new Date(data.beginningDate);
    // console.log('----> ' + JSON.stringify(data.beginningDate));
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    // console.log('----> ' + JSON.stringify(data.endingDate));
    end.setHours(23, 59, 0, 0);

    // console.log(bgn + ' -- ' + end);

    return this._firestore.collection('notifications', ref => {
      const request = ref.where('toShowTo', 'array-contains', this.currentUser.uid);
      return request.orderBy('creationDate', 'desc');
    }).snapshotChanges();
  }

  getExecutions(data: any) {
    const bgn = new Date(data.beginningDate);
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    end.setHours(24, 0, 0, 0);

    return this._firestore.collection('executions', ref => {
      const request = ref.where('creationDate', '>=', bgn)
        .where('creationDate', '<=', end)
        .where('assignedTo', '==', this.currentUser.uid);

      return request.orderBy('creationDate', 'desc');
    }).get();
  }

  getAssignedTasks(data: any) {
    const bgn = new Date(data.beginningDate);
    bgn.setHours(0, 0, 0, 0);

    const end = new Date(data.endingDate);
    end.setHours(24, 0, 0, 0);

    return this._firestore.collection('tasks', ref => {
      const request = ref.where('creationDate', '>=', bgn)
        .where('creationDate', '<=', end)
        .where('assignerId', '==', this.currentUser.uid);

      return request.orderBy('creationDate', 'desc').limit(100);
    }).snapshotChanges();
  }

  getGrades() {
    return this._firestore.collection('fonctions').get();
  }

  updateUserHabilitations(id: string, modules: string[]) {
    return this._firestore.collection('users').doc(id).update({
      modules
    });
  }

}
