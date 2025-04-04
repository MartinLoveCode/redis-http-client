#### Deploy

```bash
cf push --vars-file manifest.yaml
```

#### Usage

- Set key

```
curl --location 'http://localhost:5050/test' \
--header 'Content-Type: application/json' \
--data '{
    "hello": "world"
}'
```

- Get key

```
curl --location 'http://localhost:5050/test/hello'
```

- Scan key

```
curl --location 'http://localhost:5050/hScan/test/hello'
```

- Run command

```
curl --location 'http://localhost:5050/command' \
--header 'Content-Type: application/json' \
--data '{
    "command": "HGETALL",
    "parameters": [
      'CV_CONSTRUCTION_COST'
    ]
}'

```
