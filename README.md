# C# Helper VSCode Extension

Helper functions to speed up C# development.

**Functions are intended to be called using keyboard shortcuts (or command search dropdown), hence no mouse menus.**

# Inject Dependency (C#)

`csharp-helper.inject-dependency`

Provides search input for finding \*.cs files, adds selected file name to constructor, creates private readonly field, formats constructor on separate lines if it has more than one parameter.

Constructor will be created if it doesn't exist.

![alt text](https://raw.githubusercontent.com/sharklasers996/csharp-helper/master/assets/inject-dependency.gif)

# Create C# files

Provides prompt to select path, creates files from template.
Files are created with correct namespace.

- Create New Class (C#)

`csharp-helper.create-class`

- Create New Interface (C#)

`csharp-helper.create-interface`

- Create New Enum (C#)

`csharp-helper.create-enum`

- Create New Test Class (C#)

`csharp-helper.create-test`

![alt text](https://raw.githubusercontent.com/sharklasers996/csharp-helper/master/assets/new-class.gif)

# Embed selected text into a code block (C#)

`csharp-helper.embed-code`

Provides prompt to select template, surrounds selected text with template.

Available templates:

```
try { ... } catch(Exception ex) { ... }

if (...) { ... }
```

![alt text](https://raw.githubusercontent.com/sharklasers996/csharp-helper/master/assets/embed-code.gif)

# Fix namespace (C#)

`csharp-helper.fix-namespace`

Corrects namespace in current file based on path to project.

![alt text](https://raw.githubusercontent.com/sharklasers996/csharp-helper/master/assets/fix-namespace.gif)

# Fix filename (C#)

`csharp-helper.fix-filename`

Renames file to match class name.

![alt text](https://raw.githubusercontent.com/sharklasers996/csharp-helper/master/assets/fix-filename.gif)

# Toggle Method Sync (C#)

`csharp-helper.toggle-method-sync`

Changes method signature to async and vice versa

![alt text](https://raw.githubusercontent.com/sharklasers996/csharp-helper/master/assets/toggle-method-sync.gif)
