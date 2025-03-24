import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list'; 
import jaLocale from '@fullcalendar/core/locales/ja';
import interactionPlugin from "@fullcalendar/interaction"
import React, { useEffect, useState } from 'react';
import { Plan } from '../../components/Calendar/Plan';
import { Result } from '../../components/Calendar/Result';
import { Create } from '../../components/Calendar/Create';
import { Complete } from '../../components/Calendar/Complete';
import { EditPlan } from '../../components/Calendar/EditPlan';
import { EditResult } from '../../components/Calendar/EditResult';
import { Header } from '../../components/Header/Header'; 
import { co, ex } from '@fullcalendar/core/internal-common';
import { idText } from 'typescript';


export interface Field {
  id: number;
  name: string;
  area: string;
  url: string;
}

export interface Plan {
  id: number;
  date: string;
  comment: string;
}

interface Event {
  title: string;
  start: string;
  backgroundColor?: string;
  groupId: string;
  content?: string;
}

export interface Report {
  id: number;
  customer: string;
  customer_id: number;
  field: Field;
  date: string;
  plans: Plan[];
  report?: string; 
  onChangeDetail: (detail:string, id?:number) => void;
}

export interface ReportProps {
  selectedReport: Report;
}


export function Calendar() {
  const [selectedDate, setSelectedDate] = useState<string>();
  const [prevEvent, setPrevEvent] = useState<any>();
  const [calendar, setCalendar] = useState<Event[]>([]);
  const [detailDisplay, setDetailDisplay] = useState<string>("create");
  const [selectedReport, setSelectedReport] = useState<Report>();
  
  //詳細画面を変更するときの処理
  const onChangeDetail = async(detail:string, id?:number) => {    
    //情報を変更したときに再取得するための処理
    if(id){
      //APIから詳細情報を取得
      console.log("詳細画面を変更");
      try {
        const url = new URL('https://hjye2epvlltzqedatmaukpwm4e0iderg.lambda-url.ap-northeast-1.on.aws/report');
        const filter = JSON.stringify({ id: id });
        url.searchParams.append('filter', filter);
        console.log("filter");
        console.log(filter);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Success:', data);
        console.log(data.result.plans);

        setSelectedReport({
          id: id,
          customer_id: data.result.customer_id,
          customer: data.result.customer,
          field: data.result.field,
          date: data.result.date,
          plans: data.result.plans,
          report: data.result.report,
          onChangeDetail: onChangeDetail
        });
      } catch (error) {
          console.error('Error:', error);
      }   
    }
      setDetailDisplay(detail);
  }
  
  //日付をクリックしたときの処理
  const handleDateClick = (arg:any) => {
    setSelectedDate(arg.dateStr);
    setSelectedReport(undefined);
    setDetailDisplay("create");
  }

  //イベントをクリックしたときの処理
  const eventClick= async(info:any) => {
    // 選択中のイベントの枠を赤くする
    prevEvent?.style.removeProperty('border-color');
    info.el.style.borderColor = 'red';
    setPrevEvent(info.el);
    
    //APIから詳細情報を取得
    try {
      const url = new URL('https://hjye2epvlltzqedatmaukpwm4e0iderg.lambda-url.ap-northeast-1.on.aws/report');
      const filter = JSON.stringify({ id: info.event.extendedProps.reportId });
      url.searchParams.append('filter', filter);

      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          }
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Success:', data);
      console.log(data.result.plans);

      setSelectedReport({
        id: info.event.extendedProps.reportId,
        customer: data.result.customer,
        customer_id: data.result.customer_id,
        field: data.result.field,
        date: data.result.date,
        plans: data.result.plans,
        report: data.result.report,
        onChangeDetail: onChangeDetail
      });       
      
      //詳細画面を表示
      setDetailDisplay(info.event.groupId);

    } catch (error) {
        console.error('Error:', error);
    }
  }

  //APIから全ての予定と結果を取得
  useEffect(() => {
    // APIからデータを取得する
    fetch('https://hjye2epvlltzqedatmaukpwm4e0iderg.lambda-url.ap-northeast-1.on.aws/all_calendar')
        .then(response => response.json())
        .then((data: any) => {
            console.log(data); // レスポンスデータの形式を確認
            setCalendar(data.result);

        })
        .catch(error => console.error('Error fetching fields:', error));
    }, [detailDisplay]);

  const eventExample = [
    { title: 'event 1', date: '2024-04-01' },
    { title: 'event 2', date: '2024-04-02' }
  ];

  return (
    <>
      <Header />
      <div className="md:flex flex-column md:flex-row">
        <div className="md:w-3/4 p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]} 
            height='90vh'
            fixedWeekCount={false}
            initialView="dayGridMonth"
            locales={[jaLocale]}
            locale='ja'
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'today', 
            }}
            eventContent={renderEventContent}
            events={calendar}
            // events={eventExample}
            dateClick={handleDateClick}
            eventClick={eventClick}
          />
        </div>
        <div className="md:w-1/4 p-4 bg-gray-100">
          { detailDisplay === "create" && (
            <Create selectedDate={selectedDate} onChangeDetail={onChangeDetail}/> 
          )}
          {detailDisplay === "plan" && selectedReport && (
            <Plan selectedReport={selectedReport}/>
          )}
          {detailDisplay === "editPlan" && selectedReport && (
            <EditPlan selectedReport={selectedReport}/>
          )}
          { detailDisplay === "complete" && selectedReport && (
            <Complete selectedReport={selectedReport}/>
          )}
          {detailDisplay === "result" && selectedReport && (
            <Result selectedReport={selectedReport}/>
          )}
          {detailDisplay === "editResult" && selectedReport && (
            <EditResult selectedReport={selectedReport}/>
          )}
        </div>
      </div>
    </>
  );
}

function renderEventContent(eventInfo:any) {
  return(
    <>
      <i>{eventInfo.event.title}</i>
    </>
  )
}

