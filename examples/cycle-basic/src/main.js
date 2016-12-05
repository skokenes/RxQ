import { run } from '@cycle/rxjs-run';
import { makeDOMDriver, div, input, ul, li } from '@cycle/dom';
import { Observable } from 'rxjs';

const main = (sources) => {

    const filter$ = sources.DOM.select('.input').events('input')
        .map(e => e.target.value.toLowerCase())
        .startWith('');

    const engine$ = RxQ.connectEngine({
        host: 'sense.axisgroup.com',
        isSecure: false
    });

    const list$ = engine$
        .qGetDocList()
        .map(m => m.response.qDocList);

    const appList$ = Observable.combineLatest(filter$, list$, (filter, list) => ({
        filter,
        list: list
            .filter(f => f.qDocName.toLowerCase().indexOf(filter) >= 0)
            .sort((a, b) => {
                a = a.qDocName.toLowerCase();
                b = b.qDocName.toLowerCase();
                return a == b ? 0 : a < b ? -1 : 1;
            })
    }));

    appList$.subscribe(s => console.log(`Search Term: \'${s.filter}\' | Filtered Doc List: `, s.list));

    const vdom$ = appList$.map(m => div('.container', [
        input('.input'),
        ul('.application-list', { style: { 'list-style-type': 'none', 'padding': '0px' } },
            m.list.map(n => li('.application-list-item', n.qDocName)))
    ]));

    return {
        DOM: vdom$
    };
}

run(main, {
    DOM: makeDOMDriver('#app-container'),
});