var comb = require("comb"),
    sys = require("util"),
    string = comb.string;

var COVERAGE_HEADER = string.format('\n %s \n', string.style("Test Coverage", "bold"));
var TABLE_SEP = string.format("+%--42s+%--11s+%--6s+%--7s+%--7s+", "-", "-", "-", "-", "-");
TABLE_SEP = comb.hitch(string, "format", TABLE_SEP + "\n%s\n" + TABLE_SEP);
var PRINT_FORMAT = comb.hitch(string, "format", "| %-40s | %9s | %4s | %5s | %6s|");

function printFile(file) {
    sys.error(PRINT_FORMAT(file.name, "" + file.coverage, "" + file.LOC, "" + file.SLOC, "" + file.totalMisses));
}

function printFileSource(file) {
    if (file.coverage < 100) {
        sys.error(string.format('\n %s \n %s \n' + string.style(file.name, "bold"), file.source));
    }
}

function reportCoverageTable(cov) {
    cov.files.sort(function (a, b) {
        return b.coverage - a.coverage;
    });
    // Source
    cov.files.forEach(printFileSource);
    // Stats
    var print = sys.error;
    print(COVERAGE_HEADER);
    print(TABLE_SEP(PRINT_FORMAT('Filename', 'Coverage', 'LOC', 'SLOC', 'Missed')));
    cov.files.forEach(printFile);
    print(TABLE_SEP(PRINT_FORMAT("Total", "" + cov.coverage, "" + cov.LOC, "" + cov.SLOC, "" + cov.totalMisses)));
}


function coverage(data, val) {
    var n = 0;
    for (var i = 0, len = data.length; i < len; ++i) {
        if (data[i] !== undefined && Boolean(data[i]) === val) ++n;
    }
    return n;
}

function getFileFormatter(file) {
    var width = file.source.length.toString().length;

    return function formatSource(line, i) {
        ++i;
        var hits = file[i] === 0 ? 0 : (file[i] || ' ');
        if (hits === 0) {
            hits = string.style(string.pad(hits, 5, null, true), ["bold", "red"]);
            line = string.style(line, "redBackground");
        } else {
            hits = string.style(string.pad(hits, 5, null, true), "bold");
        }
        return string.format('\n %-' + width + 's | %s | %s', "" + i, "" + hits, "" + line);
    }
}


function populateCoverage(cov) {
    cov.LOC = cov.SLOC = cov.totalHits = cov.totalMisses = cov.coverage = 0;
    var files = [];
    for (var name in cov) {
        var file = cov[name];
        if (comb.isArray(file)) {
            // Stats
            files.push(file);
            delete cov[name];
            cov.totalHits += file.totalHits = coverage(file, true);
            cov.totalMisses += file.totalMisses = coverage(file, false);
            cov.SLOC += file.SLOC = file.totalHits + file.totalMisses;
            !file.source && (file.source = []);
            cov.LOC += file.LOC = file.source.length;
            file.coverage = ((file.totalHits / file.SLOC) * 100).toFixed(2);
            // Source
            file.name = name;
            if (file.coverage < 100) {
                file.source = file.source.map(getFileFormatter(file)).join('');
            }
        }
    }
    cov.coverage = ((cov.totalHits / cov.SLOC) * 100).toFixed(2);
    cov.files = files;
}

exports.showCoverage = function showCoverage(jscoverage) {
    if (typeof jscoverage === 'object') {
        populateCoverage(jscoverage);
        if (jscoverage.coverage) {
            reportCoverageTable(jscoverage);
        }
    }
};