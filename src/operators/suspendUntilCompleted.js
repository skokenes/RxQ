import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

export default session => src$ =>
  Observable.create(observer => {
    src$.pipe(tap(session => session.suspend())).subscribe({
      next: ([n, h]) => observer.next(n),
      error: err => observer.error(err),
      complete: () => {
        session.unsuspend();
        observer.complete();
      }
    });
  });
