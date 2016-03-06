#!/bin/bash

PLIST=platforms/ios/*/*-Info.plist

cat << EOF |
Add :NSAppTransportSecurity dict
Add :NSAppTransportSecurity:NSExceptionDomains dict
Add :NSAppTransportSecurity:NSExceptionDomains:butthole.tv dict
Add :NSAppTransportSecurity:NSExceptionDomains:butthole.tv:NSIncludesSubdomains bool YES
Add :NSAppTransportSecurity:NSExceptionDomains:butthole.tv:NSExceptionAllowsInsecureHTTPLoads bool YES
EOF
while read line
do
    /usr/libexec/PlistBuddy -c "$line" $PLIST
done

true