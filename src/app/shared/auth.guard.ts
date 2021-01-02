import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private _auth: AuthService, private _router: Router) { }

  canActivate(): boolean {
    this._auth.isLogin().then(isLogin => {
      console.log('guard', isLogin);
      if (isLogin) {
        return true;
      } else {
        this._router.navigate(['/login']);
        return false;
      }
    });
    return true;
  }
  canActivateChild(): boolean {
    this._auth.isLogin().then(isLogin => {
      console.log('childeguard', isLogin);
      if (isLogin) {
        return true;
      } else {
        this._router.navigate(['/login']);
        return false;
      }
    });

    return true;
  }
  
}
