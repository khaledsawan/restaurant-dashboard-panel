openapi-generator generate \
  -i swagger.json \
  -g typescript-angular \
  -o src/app/shared/service-proxies \
  --additional-properties=providedIn=root,useRxJS7=true,withInterfaces=true,withInjectionToken=true,ngVersion=21