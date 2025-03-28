### Prerequisites

```bash
npm install
```

Create an .env in root dir
```javascript
ACCOUNT_KEY=
ACCOUNT_NAME=
BUCKET=
```

### How to run

On index.js change this line to the option you want
```javascript
const currentRequest = request.read_file;
```

Available options:
```javascript
list_all_files
read_file
copy_file
delete_file
```

the run
```bash
npm start
```

### OIC libraries

Cannot use:

- Destructuring
- let, const
- console
- string interpolation

Can use:
- Arrow functions
- map