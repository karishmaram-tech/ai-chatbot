import json

dashboard = {
    "dashboard": {
        "title": "AI Chatbot Dashboard",
        "schemaVersion": 36,
        "version": 1,
        "refresh": "10s",
        "time": {"from": "now-1h", "to": "now"},
        "panels": [
            {
                "id": 1,
                "title": "Total Requests",
                "type": "stat",
                "gridPos": {"x": 0, "y": 0, "w": 6, "h": 4},
                "datasource": {"type": "prometheus", "uid": "prometheus"},
                "targets": [{"expr": "sum(http_requests_total)", "legendFormat": "Total", "refId": "A"}]
            },
            {
                "id": 2,
                "title": "Requests Per Second",
                "type": "stat",
                "gridPos": {"x": 6, "y": 0, "w": 6, "h": 4},
                "datasource": {"type": "prometheus", "uid": "prometheus"},
                "targets": [{"expr": "sum(rate(http_requests_total[1m]))", "legendFormat": "RPS", "refId": "A"}]
            },
            {
                "id": 3,
                "title": "Success Rate %",
                "type": "gauge",
                "gridPos": {"x": 12, "y": 0, "w": 6, "h": 4},
                "datasource": {"type": "prometheus", "uid": "prometheus"},
                "targets": [{"expr": "sum(http_requests_total{status=\"2xx\"}) / sum(http_requests_total) * 100", "legendFormat": "%", "refId": "A"}]
            },
            {
                "id": 4,
                "title": "Total Exceptions",
                "type": "stat",
                "gridPos": {"x": 18, "y": 0, "w": 6, "h": 4},
                "datasource": {"type": "prometheus", "uid": "prometheus"},
                "targets": [{"expr": "sum(http_requests_total{status=\"5xx\"}) or vector(0)", "legendFormat": "Errors", "refId": "A"}]
            },
            {
                "id": 5,
                "title": "Requests by Endpoint",
                "type": "bargauge",
                "gridPos": {"x": 0, "y": 4, "w": 24, "h": 8},
                "datasource": {"type": "prometheus", "uid": "prometheus"},
                "targets": [{"expr": "sort_desc(sum by(handler) (http_requests_total))", "legendFormat": "{{handler}}", "refId": "A"}]
            },
            {
                "id": 6,
                "title": "Request Rate Over Time",
                "type": "timeseries",
                "gridPos": {"x": 0, "y": 12, "w": 24, "h": 8},
                "datasource": {"type": "prometheus", "uid": "prometheus"},
                "targets": [{"expr": "sum by(handler) (rate(http_requests_total[1m]))", "legendFormat": "{{handler}}", "refId": "A"}]
            }
        ]
    },
    "overwrite": True,
    "folderId": 0
}

with open("dashboard.json", "w", encoding="utf-8", newline="\n") as f:
    json.dump(dashboard, f, indent=2)

print("dashboard.json created!")
print("File size:", len(open("dashboard.json").read()), "bytes")

# Validate JSON
with open("dashboard.json") as f:
    data = json.load(f)
print("JSON is valid!")
print("Panels:", len(data["dashboard"]["panels"]))

