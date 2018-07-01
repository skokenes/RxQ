import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

export default session => src$ => {
  return Observable.create(observer => {
    session.suspend();
    src$.subscribe({
      next: n => observer.next(n),
      error: err => observer.error(err),
      complete: () => {
        session.unsuspend();
        observer.complete();
      }
    });
  });
};
