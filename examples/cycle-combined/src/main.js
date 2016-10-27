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

    const engine$$ = Observable.from(servers)
        .map(m => RxQ.connectEngine(m))
        .combineAll()
        .share();

    const list$$ = engine$$
        .mergeMap(engines => {
            return engines.map(e => e.GetDocList()) 
        })
        .combineAll()
        .withLatestFrom(engine$$, (lists, engines) => {
            return engines.reduce((acc, curr, i) => {
                return acc.concat(lists[i].qDocList.map(m => {
                    m.server = curr.session.config.host;
                    return m;
                }));
            }, []);
        })
        .combineLatest(filter$, (lists, filter) => {
            return {
                list: lists.filter(f => f.qDocName.toLowerCase().indexOf(filter) >= 0)
                    .sort((a, b) => {
                        a = a.qDocName.toLowerCase();
                        b = b.qDocName.toLowerCase();
                        return a == b ? 0 : a < b ? -1 : 1;
                    }),
                filter
            };
        });

    list$$.subscribe(s => console.log(`Search Term: \'${s.filter}\' | Filtered Doc List: `, s.list));

    const vdom$ = list$$.map(m => div('.container', [
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