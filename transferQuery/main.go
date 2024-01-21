package main

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
)

type Validator struct {
  Pubkey string `json:"pubkey"`
  Withdrawal_credentials string `json:"withdrawal_credentials"`
  Effective_balance string `json:"effective_balance"`
  Slashed bool `json:"slashed"`
  Activation_eligibility_epoch string `json:"activation_eligibility_epoch"`
  Activation_epoch string `json:"activation_epoch"`
  Exit_epoch string `json:"exit_epoch"`
  Withdrawable_epoch string `json:"withdrawable_epoch"`
}

type Data struct {
  Index string `json:"index"`
  Balance string `json:"balance"`
  Status string `json:"status"`
  Validator Validator `json:"validator"`
}

type Info struct {
  Data []Data `json:"data"`
  Finalized bool `json:"finalized"`
  Execution_optimistic bool `json:"execution_optimistic"`
}

type RequestData struct {
   Id string `json:"id"`
   Url string `json:"url"`
}

func getValidatorsInfo(url_bn string,id string) (Info, error) {
	url := url_bn + "?id=" + id

	req, err := http.NewRequest("GET", url, nil)
	req.Header.Add("Cache-Control", "no-cache")
  
  var info Info

	if err != nil {
		return info, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return info, err
	}

	defer res.Body.Close()
  errror := json.NewDecoder(res.Body).Decode(&info)
  
  return info, errror
}

func main() {
  r := chi.NewRouter()

  r.Use(cors.Handler(cors.Options{
    AllowedOrigins:   []string{"https://*", "http://*"},
    AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
    ExposedHeaders:   []string{"Link"},
    AllowCredentials: false,
    MaxAge:           300, // Maximum value not ignored by any of major browsers
    }))

    r.Post("/api",func (w http.ResponseWriter, r *http.Request) {
      if r.Method != "POST" {
        http.Error(w, "Invalid request method", http.StatusBadRequest)
        return
      }

      var data RequestData
      var info Info
      var infoTmp Info
      var last int
    indexFetch := 0

      err := json.NewDecoder(r.Body).Decode(&data)
      if err != nil {
        http.Error(w, "Error decoding JSON body", http.StatusBadRequest)
        return
      }
       
      validators := strings.Split(data.Id, ",")
      countValidators := len(validators)
    
      for i := 1; indexFetch < countValidators; i=i+500 {
        if countValidators < 500 {
          last = countValidators
        } else if countValidators / i > 2 {
          last = 500
        } else if countValidators % 500 == 0{
          last = 500
        }else {
          last = countValidators % 500
        }

        params := strings.Join(validators[i-1:i+last-1], ",")

        if i == 0 {
          info, _ = getValidatorsInfo(data.Url,params)
        } else {
          infoTmp, _ = getValidatorsInfo(data.Url,params)
          info.Data = append(info.Data, infoTmp.Data...)
        }
        
        indexFetch = indexFetch + last
      }

      w.WriteHeader(http.StatusOK)
      json.NewEncoder(w).Encode(&info)

    })

  http.ListenAndServe(":8080", r)
       
}
