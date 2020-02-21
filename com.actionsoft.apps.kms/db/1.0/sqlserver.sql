CREATE TABLE APP_ACT_KMS_CARD (ID char(36) not null default '',  CARDNAME nvarchar(128) null default NULL,  CARDTYPE smallint null default NULL,  CREATEUSER varchar(36) null default NULL,  CREATETIME datetime null default NULL,  LASTUPDATE datetime null default NULL,  READCOUNT bigint null default NULL,  ONLINELEVEL smallint null default NULL,  SECURITYLEVEL smallint null default NULL,  ISPUBLISHED smallint null default NULL,  VALIDDATE datetime null default NULL,ISCOMMENT smallint null default NULL,  constraint PK_APP_ACT_KMS_CARD primary key nonclustered (ID))
CREATE TABLE APP_ACT_KMS_DIMENSION (ID char(36) not null default '',  DIMENSIONNAME nvarchar(128) null default NULL,  PARENTID char(36) null default NULL,  SHOWTYPE smallint null default NULL,  ISEXAMINE smallint null default NULL,  MEMO nvarchar(1000) null default NULL,  CREATEUSER varchar(36) null default NULL, CREATETIME datetime null default NULL,  LASTUPDATE datetime null default NULL,  HOTSPOTDEFID char(36) null default NULL,  ISENABLED smallint null default NULL,  ORDERINDEX int null default NULL,  constraint PK_APP_ACT_KMS_DIMENSION primary key nonclustered (ID))
CREATE TABLE APP_ACT_KMS_FILE (ID char(36) not null default '',  CARDID char(36) null default NULL,  FILENAME nvarchar(128) null default NULL,  FILEVER varchar(32) null default NULL,  FILESIZE bigint null default NULL,  FILESTATE smallint null default NULL,  CREATETIME datetime null default NULL,  CREATEUSER varchar(36) null default NULL,ISFULLSEARCH smallint null default 0,  constraint PK_APP_ACT_KMS_FILE primary key nonclustered (ID))
create table APP_ACT_KMS_HOTSPOT_DEF ( ID char(36) not null, HOTSPOTNAME nvarchar(256) null default NULL,HOTSPOTMETAID varchar(36) null default NULL, CREATETIME datetime null default NULL,CREATEUSER varchar(36) null default NULL, MEMO nvarchar(1000) null default NULL, constraint PK_APP_ACT_KMS_HOTSPOT_DEF primary key nonclustered (ID))
CREATE TABLE APP_ACT_KMS_HOTSPOT (ID char(36) not null default '',HOTSPOTDEFID char(36) null default NULL,  SHAPEID varchar(128) null default NULL,  DIMENSIONID char(36) null default NULL,BINDTYPE smallint default NULL,LINKURL nvarchar(128) default NULL,TARGET nvarchar(128) default NULL,  constraint PK_APP_ACT_KMS_HOTSPOT primary key nonclustered (ID))
CREATE TABLE APP_ACT_KMS_LOG (ID char(36) not null default '',  CARDID char(36) null default NULL,  FILEID char(36) null default NULL,  ACCESSUSER varchar(36) null default NULL,  ACCESSTIME datetime null default NULL,  IPADDRESS varchar(128) null default NULL,  LOGTYPE smallint null default NULL,  constraint PK_APP_ACT_KMS_LOG primary key nonclustered (ID))
CREATE TABLE APP_ACT_KMS_META_ATTR (ID char(36) not null default '',  SCHEMAID char(36) null default NULL,  ATTRTITLE nvarchar(80) null default NULL,  CREATETIME datetime null default NULL,  CREATEUSER varchar(36) null default NULL,  constraint PK_APP_ACT_KMS_META_ATTR primary key nonclustered (ID))
CREATE TABLE APP_ACT_KMS_META_DATA (ID char(36) not null default '',  CARDID char(36) null default NULL,  SCHEMAID char(36) null default NULL,  ATTRID char(36) null default NULL,  CREATETIME datetime null default NULL,  CREATEUSER varchar(36) null default NULL,  METATEXT nvarchar(128) null default NULL,  constraint PK_APP_ACT_KMS_META_DATA primary key nonclustered (ID))
CREATE TABLE APP_ACT_KMS_META_SCHEMA (ID char(36) not null default '',  SCHEMATITLE nvarchar(36) null default NULL,  SCHEMASHOWTYPE smallint null default NULL,  SCHEMADESC nvarchar(1000) null default NULL,  CREATETIME datetime null default NULL,  LASTUPDATE datetime null default NULL,  CREATEUSER varchar(36) null default NULL,  ISNULLABLE smallint null default NULL,  ISSEARCH smallint null default NULL,ORDERINDEX int null default NULL,  constraint PK_APP_ACT_KMS_META_SCHEMA primary key nonclustered (ID))
CREATE TABLE APP_ACT_KMS_PUBLISH (ID char(36) not null default '',  CARDID char(36) null default NULL,  DIMENSIONID char(36) null default NULL,  PUBLISHUSER varchar(36) null default NULL,  PUBLISHTIME datetime null default NULL,  TAG nvarchar(256) null default NULL,  MEMO nvarchar(1000) null default NULL, EXAMINEINFO nvarchar(100) null default NULL, constraint PK_APP_ACT_KMS_PUBLISH primary key nonclustered (ID))
CREATE TABLE APP_ACT_KMS_VERSION (ID char(36) not null default '',  VERSIONNO varchar(80) null default NULL,  CREATETIME datetime null default NULL, CREATEUSER varchar(36) null default NULL, MEMO nvarchar(1000) null default NULL,  constraint PK_APP_ACT_KMS_VERSION primary key nonclustered (ID))
CREATE TABLE APP_ACT_KMS_OPT (ID char(36) not null, CARDID char(36) null default NULL, OPTUSER varchar(36) null default NULL, OPTTYPE smallint null default NULL, OPTTIME datetime null default NULL, OPTCONTENT nvarchar(1000) null default NULL, constraint PK_APP_ACT_KMS_OPT primary key nonclustered (ID))