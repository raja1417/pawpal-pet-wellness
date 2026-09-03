{{- define "pawpal.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "pawpal.fullname" -}}
{{- if .Values.fullnameOverride }}{{ .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}{{ else }}{{ printf "%s-%s" .Release.Name (include "pawpal.name" .) | trunc 63 | trimSuffix "-" }}{{ end }}
{{- end }}

{{- define "pawpal.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | quote }}
app.kubernetes.io/name: {{ include "pawpal.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "pawpal.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pawpal.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "pawpal.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}{{ default (include "pawpal.fullname" .) .Values.serviceAccount.name }}{{ else }}{{ default "default" .Values.serviceAccount.name }}{{ end }}
{{- end }}

{{- define "pawpal.secretName" -}}
{{- if .Values.secrets.create }}{{ include "pawpal.fullname" . }}{{ else }}{{ required "secrets.existingSecret is required when secrets.create=false" .Values.secrets.existingSecret }}{{ end }}
{{- end }}
