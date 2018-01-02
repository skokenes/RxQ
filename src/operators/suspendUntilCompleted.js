import { Observable } from "rxjs/Observable";
import { tap, withLatestFrom } from "rxjs/operators";

export default (eng$) => (src$) => Observable.create((observer) => {

    let _suspended$;

    src$.pipe(
        withLatestFrom(eng$.pipe(
            tap(h => {
                _suspended$ = h.session.suspended$;
                _suspended$.next(true);
            })
        ))
    ).subscribe({
        next: ([n, h]) => observer.next(n),
        error: err => observer.error(err),
        complete: () => {
            _suspended$.next(false);
            observer.complete();
        }
    });

});