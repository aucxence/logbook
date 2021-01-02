import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs/internal/Observable';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Upload } from '../models/upload';
import * as firebase from 'firebase';
import { Response, ResponseCode } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class FireService {

  private task: firebase.storage.UploadTask;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) { }

  pushUpload(collection: string, storagepath: string, upload: Upload, avant: boolean, id: string): Promise<Response> {

    const reference: DocumentReference = this.db.collection(collection).doc(id).ref;

    const response = new Response();

    return new Promise((resolve, reject) => {

      // The storage path
      const path = `${storagepath}${Date.now()}_${upload.file.name}`;

      // Reference to storage bucket
      const storageRef = firebase.storage().ref();

      // The main task
      this.task = storageRef.child(path).put(upload.file);

      this.task.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          upload.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // console.log('> > > ' + upload.progress + '> > > ' + snapshot.bytesTransferred + + '> > > ' + snapshot.totalBytes);
        },
        (error) => {
          // console.log(error);
          response.code = ResponseCode.Error;
          response.message = error.message as string;

          reject(response);
        },
        () => {

          // console.log('--> le chemin est: ' + path);
          storageRef.child(path).getDownloadURL().then((url) => {
            // console.log('--> Nous sommes entrés: ' + path);
            upload.name = upload.file.name;
            if (avant === true) {
              reference.update({
                avant: path,
              }).catch((e) => {
                response.code = ResponseCode.Error;
                response.message = e.message;

                reject(response);
              });
            } else {
              reference.update({
                apres: path,
              }).catch((e) => {
                response.code = ResponseCode.Error;
                response.message = e.message;

                reject(response);
              });
            }
            response.code = ResponseCode.Success;
            response.message = path + ' ' + url;

            resolve(response);
          })
            .catch((e) => {
              // console.log('this error');
              response.code = ResponseCode.Error;
              response.message = e.message;

              reject(response);
            });

        });

    });

  }

  add(collection: string, data): Promise<Response> { // works for everything
    // console.log(data);
    return new Promise((resolve, reject) => {
      this.db.collection(collection).add(data).then((doc) => {
        const response = new Response();
        response.code = ResponseCode.Success;
        response.message = doc.id + 'Ajout réussi';
        resolve(response);
      }).catch((e) => {
        const response = new Response();
        response.code = ResponseCode.Error;
        response.message = e.message;
        reject(response);
      });
    });
  }

  getUrl(path: string): Promise<Response> { // works for everything
    return new Promise((resolve, reject) => {
      // Reference to storage bucket
      // console.log('1');
      const storageRef = firebase.storage().ref();

      storageRef.child(path).getDownloadURL().then((url) => {
        const response = new Response();
        response.code = ResponseCode.Success;
        response.message = 'Fichier retrouvé à l\'adresse ' + url;
        resolve(response);
      }).catch((e) => {
        const response = new Response();
        response.code = ResponseCode.Error;
        response.message = e.message;
        reject(response);
      });
    });
  }

  get(collection: string): Observable<DocumentChangeAction<unknown>[]> {
    return this.db.collection(collection, ref => ref.orderBy('index', 'desc')).snapshotChanges();
  }

  addITCS(data): Promise<Response> {
    // console.log(data);
    return new Promise((resolve, reject) => {
      this.db.collection('it-courriers-sortants').add(data).then((doc) => {
        const response = new Response();
        response.code = ResponseCode.Success;
        response.message = doc.id + ' Courrier sortant ajouté avec succès';
        resolve(response);
      }).catch((e) => {
        const response = new Response();
        response.code = ResponseCode.Error;
        response.message = e.message;
        reject(response);
      });
    });
  }

  getITCS(): Observable<DocumentChangeAction<unknown>[]> {
    return this.db.collection('it-courriers-sortants', ref => ref.orderBy('index', 'desc')).snapshotChanges();
  }

  pushUploadITCS(upload: Upload, avant: boolean, id: string): Promise<Response> {

    const reference: DocumentReference = this.db.collection('it-courriers-sortants').doc(id).ref;

    const response = new Response();

    return new Promise((resolve, reject) => {

      // The storage path
      const path = `IT/CS/${Date.now()}_${upload.file.name}`;

      // Reference to storage bucket
      const storageRef = firebase.storage().ref();

      // The main task
      this.task = storageRef.child(path).put(upload.file);

      this.task.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          upload.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          // console.log(error);
          response.code = ResponseCode.Error;
          response.message = error.message as string;

          reject(response);
        },
        () => {

          // console.log('--> le chemin est: ' + path);
          storageRef.child(path).getDownloadURL().then((url) => {
            // console.log('--> Nous sommes entrés: ' + path);
            upload.name = upload.file.name;
            if (avant === true) {
              reference.update({
                avant: path,
              }).catch((e) => {
                response.code = ResponseCode.Error;
                response.message = e.message;

                reject(response);
              });
            } else {
              reference.update({
                apres: path,
              }).catch((e) => {
                response.code = ResponseCode.Error;
                response.message = e.message;

                reject(response);
              });
            }
            response.code = ResponseCode.Success;
            response.message = path + ' ' + url;

            resolve(response);
          })
            .catch((e) => {
              // console.log('this error');
              response.code = ResponseCode.Error;
              response.message = e.message;

              reject(response);
            });

        });

    });

  }

  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }
}
