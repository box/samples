FROM tomcat:latest
COPY ./UnlimitedJCEPolicyJDK8/* \
    /usr/lib/jvm/java-1.8-openjdk/jre/lib/security/
RUN ["rm", "-fr", "/usr/local/tomcat/webapps/ROOT"]
ADD ./config.json /usr/local/tomcat/
ADD ./target/servlet-with-box-and-auth0.war /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8080
CMD ["catalina.sh", "run"]