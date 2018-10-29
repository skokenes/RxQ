import { Observable } from "rxjs";

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
