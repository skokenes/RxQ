# Why Rx?
[Reactive programming](https://en.wikipedia.org/wiki/Reactive_programming) is a declarative style of programming that enables developers to define variables as entities that change over time, with their behavior and interdependencies clearly defined. This approach is best represented in the following pseudocode examples:

*Non-reactive*
```
a = 1;
b = a + 1;
a = 2;

print a; // -> 2
print b; // -> 2
```

*Reactive*
```
a = 1;
b = a + 1;
a = 2;

print a; // -> 2
print b; // -> 3
```

In the reactive example, the variable `b` is declared as depending on `a`, so when `a` changes, `b` necessarily changes.

Because of this feature, reactive programming is useful in highly interactive interfaces, especially when complex relationships exist between various variables. It also lends itself to asynchronous operations, where time delays affect when and how variables in a program change. When used properly, Rx enables scalable and maintainable code for complex, dynamic applications.

For more on Rx, we highly recommend this guide to get started: [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754), by [André Staltz](https://gist.github.com/staltz).

Or if you're looking for a quicker summary, try this [shorter read](https://branch-blog.qlik.com/what-is-reactive-programming-a1e82cf28575).

## Rx & Qlik
Because Rx works so well with dynamic applications, it pairs well with Qlik and it's engine. At its core, the Qlik Associative Engine (QAE) can be thought of as a reactive interface. It models data into a **state** that is modified by interactions like filtering data, causing the state of the model to update and any existing calculations to be recalculated based on this new state. In other words, the data model state in the engine is a dynamic entity that can change over time. This fits perfectly with Rx's strengths!

RxQ bridges the gap between RxJS and QAE, enabling developers to leverage reactive programming when working with Qlik.