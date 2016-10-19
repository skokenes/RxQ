import {run} from '@cycle/rxjs-run';
import {makeDOMDriver, div, input, ul, li} from '@cycle/dom';
import {Observable} from 'rxjs';

// This comes in from the index.html (to be corrected once npm module is published).
//import * as RxQ from '../../../build/rxqap-engine';

const main = (sources) => {

    const filter$ = sources.DOM.select('.input').events('input')
        .map(e => e.target.value.toLowerCase())
        .startWith('');

    const engine$ = RxQ.connectEngine({ 
        host: 'sense.axisgroup.com',
        isSecure: false 
    });

    const list$ = engine$
        .mergeMap(m => m.GetDocList())
        .map(m => m.qDocList);

    const appList$ = Observable.combineLatest(filter$, list$,
        (search, list) => 
            list
                .filter(f => f.qDocName.toLowerCase().indexOf(search) >= 0)
                .sort((a, b) => {
                    a = a.qDocName.toLowerCase();
                    b = b.qDocName.toLowerCase();
                    return a == b ? 0 : a < b ? -1 : 1;
                })
        );

    const vdom$ = appList$.map(m => div('.container', [
        input('.input'),
        ul('.application-list', { style: { 'list-style-type': 'none', 'padding': '0px' } },
            m.map(n => li('.application-list-item', n.qDocName)))
    ]));

    return {
        DOM: vdom$
    };
}

run(main, {
    DOM: makeDOMDriver('#app-container'),
});