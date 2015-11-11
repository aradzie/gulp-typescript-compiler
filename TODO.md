Test the following combination of options:

```json
{
    sourceMap: true,
    inlineSourceMap: true,
    inlineSources: true,
    sourceRoot: "/source/"
}
```

It causes error in `getCommonSourceDirectory()`.

TypeScript has this problem too, but it reports visible diagnostics, and our plugin does not!
