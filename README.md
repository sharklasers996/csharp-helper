# C# Helper VSCode Extension

Helper functions to speed up C# development.

## Functions

`csharp-helper.inject-dependency`

Provides search input for finding *.cs files, adds selected file name to constructor, creates private readonly field.

```csharp
...
private readonly IDependency _dependency;

public Constructor(IDependency dependency)
{
    _dependency = dependency;
}
...
```