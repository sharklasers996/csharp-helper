# C# Helper VSCode Extension

Helper functions to speed up C# development.

## Functions

`csharp-helper.inject-dependency`

Provides search input for finding *.cs files, adds selected file name to constructor, creates private readonly field.

Constructor will be created if it doesn't exist.

```csharp
...
private readonly IDependency _dependency;

public Constructor(IDependency dependency)
{
    _dependency = dependency;
}
...
```

`csharp-helper.create-class`

`csharp-helper.create-enum`

`csharp-helper.create-interface`

Provides prompt to select path, creates files from template.

`csharp-helper.create-test`

Provides prompt to select path, creates XUnit test class from template.

`csharp-helper.embed-code`

Provides prompt to select template, surrounds selected text with template.