import {run} from '@cycle/rxjs-run';
import {makeDOMDriver, div, input, ul, li} from '@cycle/dom';
import {Observable} from 'rxjs';

const main = (sources) => {

    const filter$ = sources.DOM.select('.input').events('input')
        .map(e => e.target.value.toLowerCase())
        .startWith('');

    const servers = [{
        host: 'sense.axisgroup.com',
        isSecure: false
    }, {
        host: 'playground.qlik.com',
        isSecure: true,
        prefix: "anon"
    }];

    const engine$ = Observable.from(servers)
        .mergeMap(function(c) {
            return RxQ.connectEngine(c)
        })
        .take(servers.length)
        .publishReplay()
        .refCount();

    const list$ = engine$
        .map(function(global) {
            return global.getDocList()
                .map(dl=>({
                    source: global,
                    response: dl
                }));
        })
        .combineAll()
        .map(docs => 
            docs.reduce((acc, curr) =>
                acc.concat(curr.response.map(m => {
                    m.server = curr.source.session.config.host;
                    return m;
                }))
            , [])
        );

    const appList$ = Observable.combineLatest(list$, filter$, (lists, filter) => ({
        list: lists.filter(f => f.qDocName.toLowerCase().indexOf(filter) >= 0)
            .sort((a, b) => {
                a = a.qDocName.toLowerCase();
                b = b.qDocName.toLowerCase();
                return a == b ? 0 : a < b ? -1 : 1;
            }),
        filter
    }));

    appList$.subscribe(s => console.log(`Search Term: \'${s.filter}\' | Filtered Doc List: `, s.list));

    const vdom$ = appList$.map(m => div('.container', [
        input('.input', { attr: { 'placeholder': 'Filter' } }),
        ul('.application-list', { style: { 'list-style-type': 'none', 'padding': '0px' } },
            m.list.map(n => li('.application-list-item', [
                div(n.qDocName + ` (${n.server})`)
            ])))
    ]));

    return {
        DOM: vdom$
    };
}

run(main, {
    DOM: makeDOMDriver('#app-container'),
});