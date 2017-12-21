import { Observable } from "rxjs/Observable";

export default (eng$) => (src$) => Observable.create((observer) => {
    // add in logic here for "withLatestFrom" eng$ to get latest session
    ops$.subscribe({
        next: n => observer.next(n),
        error: err => observer.error(err),
        complete: () => {
            observer.complete();
        }
    })
})

// function suspendUntilComplete(eng$, ops$) {
//     return new Observable.create((observer) => {
//         suspended$.next(true);
//         ops$.subscribe({
//             next: n => observer.next(n),
//             error: err => observer.error(err),
//             complete: () => {
//                 suspended$.next(false);
//                 observer.complete();
//             }
//         });
//     });
// }